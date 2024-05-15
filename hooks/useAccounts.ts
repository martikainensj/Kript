import { UpdateMode } from "realm";
import { useQuery, useRealm } from "@realm/react";

import { Account } from "../models/Account";
import { __, confirmation } from "../helpers";
import { useEffect } from "react";

export const useAccounts = () => {
	const realm = useRealm();
	const accounts = useQuery<Account>( 'Account' );

	const addAccount = ( account: Account ) => {
		const title = `${ account._id
			? __( 'Update Account' )
			: __( 'Add Account' ) }`;
		const message = ( `${ account._id
			? __( 'Updating existing account' )
			: __( 'Adding a new account' )}: ${ account.name }` )
			+ "\n" + __( 'Are you sure?' );

		return new Promise( ( resolve, _ ) => {
			confirmation( {
				title: title,
				message: message,
				onAccept() {
					realm.write( () => {
						realm.create( 'Account', account, UpdateMode.Modified );
					} );
					resolve( account );
				}
			} );
		} );
	};

	useEffect( () => {
		realm.subscriptions.update( mutableSubs => {
			//mutableSubs.removeAll();
			mutableSubs.add( accounts );
		} );
	}, [ realm, accounts ] );

	return { accounts, addAccount }
}