import { useCallback, useMemo } from "react";
import { useRealm, useUser } from "@realm/react"

import Realm from "realm";
import { confirmation } from "../helpers";
import { __ } from "../localization";
import { useAccount } from "./useAccount";
import { Holding } from "../models/Holding";
import { Transaction } from "../models/Transaction";

interface useHoldingProps {
	_id: Realm.BSON.UUID,
	account_id: Realm.BSON.UUID
}

export const useHolding = ( { _id, account_id }: useHoldingProps ) => {
	const realm = useRealm();
	const user: Realm.User = useUser();
	const { account, getHoldingById, addTransaction, addTransfer } = useAccount( { id: account_id } );
	const holding = useMemo( () => {
		return getHoldingById( _id );
	}, [ realm, account ] );

	const { transactions, dividends } = useMemo( () => {
		return {
			...holding,
			dividends: account.transfers
				.filtered( 'holding_id == $0', holding._id )
		}
	}, [ realm, account, holding ] );

	const getTransactionById = useCallback( ( id: Realm.BSON.UUID ) => {
		const transaction = transactions
			.filtered( '_id == $0', id )[0];
		return transaction;
	}, [ realm, holding ] );

	const saveHolding = useCallback( ( editedHolding: Holding ) => {
		const title = __( 'Save Holding' );
		const message = `${ __( 'Saving existing holding' ) }: ${ editedHolding.name }`
			+ "\n" + __( 'Are you sure?' );

		return new Promise( ( resolve, _ ) => {
			confirmation( {
				title,
				message,
				onAccept() {
					resolve( realm.write( () => {
						Object.assign( holding, { ...editedHolding } );
					} ) );
				}
			} );
		} );
	}, [ holding, account ] );

	const removeHolding = useCallback( () => {
		const title = __( 'Remove Holding' );
		const message = `${ __( 'Removing existing holding' ) }: ${ holding.name }`
			+ "\n" + __( 'Are you sure?' );

		return new Promise( ( resolve, _ ) => {
			confirmation( {
				title,
				message,
				onAccept() {
					resolve( realm.write( () => {
						const index = account.holdings.findIndex( holding => {
							return holding._id.equals( _id );
						} );
						
						account.holdings.remove( index );
					} ) );
				}
			} );
		} );
	}, [ holding, account ] );

	// Variables

	const lastTransaction = useMemo( () => {
		return transactions.sorted( 'date', true )[0];
	}, [ realm, transactions ] );

	const lastPrice = lastTransaction?.price ?? 0;

	const amount = useMemo( () => {
		const amount = transactions.reduce( ( amount, transaction ) => {
			return amount + transaction.amount;
		}, 0 );

		return amount;
	}, [ realm, transactions ] );

	const transactionSum = useMemo( () => {
		const sum = transactions.reduce( ( sum, transaction ) => {
			return sum + transaction.price * transaction.amount;
		}, 0 );

		return sum;
	}, [ realm, transactions ] );

	const total = useMemo( () => {
		const total = transactions.reduce( ( total, transaction ) => {
			return total + transaction.total;
		}, 0 );

		return total;
	}, [ realm, transactions ])

	const dividendSum = useMemo( () => {
		const sum = dividends.reduce( ( sum, dividend ) => {
			return sum + dividend.amount
		}, 0 );

		return sum
	}, [ realm, dividends ] );

	const fees = total - transactionSum;
	const averagePrice = amount ? transactionSum / amount : 0;
	const averageValue = averagePrice * amount;
	const value = lastPrice * amount;
	const returnValue = value + dividendSum - total;
	const returnPercentage = value
		? ( value + dividendSum - total ) / Math.abs( total ) * 100
		: 0;

	return {
		holding, saveHolding, removeHolding,
		account,
		transactions, addTransaction, getTransactionById,
		dividends, addTransfer,
		value, amount, total, fees,
		transactionSum, dividendSum,
		lastTransaction, lastPrice,
		averagePrice, averageValue,
		returnValue, returnPercentage
	}
}