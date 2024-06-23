import React, {
	useState,
	createContext,
	useContext,
	useCallback,
} from "react";
import { useUser } from "../hooks/useUser";
import { useI18n } from "./I18nContext";
import Realm from "realm";
import { useQuery, useRealm } from "@realm/react";
import { Account, AccountKey, AccountValue } from "../models/Account";
import { Transaction, TransactionKey, TransactionValue } from "../models/Transaction";
import { Holding, HoldingKey, HoldingValue } from "../models/Holding";
import { confirmation } from "../helpers";
import { router } from "expo-router";

interface AccountContext {
	addHolding: ( name: string ) => Holding;
	addTransaction: ( transaction: Transaction ) => Promise<Transaction>;
	getHoldingBy: <K extends HoldingKey>( key: K, value: HoldingValue<K> ) => Holding;
	getTransactionBy: <K extends TransactionKey>( key: K, value: TransactionValue<K> ) => Transaction;
	saveAccount: ( account: Account ) => Promise<Account>;
	removeAccount: () => Promise<boolean>;
	updateVariables: ( variables: Partial<Record<AccountKey, AccountValue<AccountKey>>> ) => void
}

const AccountContext = createContext<AccountContext>( {
	addHolding: (): Holding => { return },
	addTransaction: (): Promise<Transaction> => { return },
	getHoldingBy: (): Holding => { return },
	getTransactionBy: (): Transaction => { return },
	saveAccount: (): Promise<Account> => { return },
	removeAccount: (): Promise<boolean> => { return },
	updateVariables: () => {}
} );

export const useAccount = () => useContext( AccountContext );

export const AccountProvider = ( { _id, children } ) => {
	const { user } = useUser();
	const { __ } = useI18n();
	const realm = useRealm();
	const account = useQuery<Account>( 'Account' )
		.filtered( '_id == $0', _id )[0];

	const getTransactionBy = useCallback( <K extends TransactionKey>( key: K, value: TransactionValue<K> ) => {
		const transaction = account?.transactions
			.filtered( `${key} == $0`, value )[0];

		return transaction;
	}, [ account ] );

	const getHoldingBy = useCallback( <K extends HoldingKey>( key: K, value: HoldingValue<K> ) => {
		const holding = account?.holdings
			.filtered( `${key} == $0`, value )[0];

		return holding;
	}, [ account ] );

	const addHolding = useCallback( ( name: string ) => {
		const holding: Holding = {
			_id: new Realm.BSON.UUID,
			name,
			owner_id: user.id,
			account_id: account._id
		}

		account.holdings.push( holding );

		return account.holdings[ account.holdings.length - 1 ];
	}, [ account ] );

	const addTransaction = useCallback( ( transaction: Transaction ): Promise<Transaction> => {
		const title = __( 'Add Transaction' );
		const message = `${ __( 'Adding a new transaction' ) }\n`
			+ __( 'Are you sure?' );

		return new Promise( ( resolve, _ ) => {
			confirmation( {
				title: title,
				message: message,
				onAccept() {
					resolve( realm.write( async () => {
						const { _id } = transaction.holding_name && (
							getHoldingBy( 'name', transaction.holding_name )
								?? addHolding( transaction.holding_name )
						);

						account.transactions.push( {
							...transaction,
							_id: new Realm.BSON.UUID(),
							holding_id: _id
					 	} );

						return account.transactions[ account.transactions.length - 1 ];
					} ) );
				}
			} );
		} );
	}, [ account ] );

	const saveAccount = useCallback( ( account: Account ): Promise<Account> => {
		const title = `${ account._id
			? __( 'Update Account' )
			: __( 'Add Account' ) }`;
		const message = ( `${ account._id
			? __( 'Updating existing account' )
			: __( 'Adding a new account' )}` )
			+ `: ${ account.name }`
			+ "\n" + __( 'Are you sure?' );

		return new Promise( ( resolve, _ ) => {
			confirmation( {
				title: title,
				message: message,
				onAccept() {
					resolve( realm.write( () => {
						return realm.create( 'Account', account, Realm.UpdateMode.Modified );
					} ) );
				}
			} );
		} )
	}, [] );

	const removeAccount = useCallback( (): Promise<boolean> => {
		const title = __( 'Remove Account' );
		const message = `${ __( 'Removing existing account' ) }: ${ account.name }`
			+ "\n" + __( 'Are you sure?' );

		return new Promise( ( resolve, _ ) => {
			confirmation( {
				title,
				message,
				onAccept() {
					router.navigate( 'accounts/' );

					realm.write( () => {
						realm.delete( account );
					} );

					resolve( true );
				}
			} );
		} );
	}, [ account ] );

	const updateVariables = useCallback( ( variables: Partial<Record<AccountKey, AccountValue<AccountKey>>> ) => {
			const hasChanges = Object.keys( variables )
				.some( key => account[ key ] !== variables[ key ] );
				
			if ( ! hasChanges ) return;

			realm.write( () => {
				Object.entries( variables ).forEach( ( [ key, value ] ) => {
					account[ key ] = value;
				} );
			} );
		}, [ realm, account ]
	);

	// TODO: variables

  return (
    <AccountContext.Provider value={ {
			addHolding,
			addTransaction,
			getHoldingBy,
			getTransactionBy,
			removeAccount,
			saveAccount,
			updateVariables
		} }>
      { children }
    </AccountContext.Provider>
  );
}