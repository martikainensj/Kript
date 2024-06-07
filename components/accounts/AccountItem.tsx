import React, { useCallback } from "react";
import { GestureResponderEvent, StyleSheet, View } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
import { router } from 'expo-router';

import { Icon } from "../ui";
import { FontWeight, GlobalStyles, Spacing } from "../../constants";
import { Account } from "../../models/Account";
import { MenuItem, useMenu } from "../contexts/MenuContext";
import { useAccount } from "../../hooks";
import { useBottomSheet } from "../contexts/BottomSheetContext";
import { useTheme } from "../contexts/ThemeContext";
import { AccountForm } from "./AccountForm";
import { Grid, Value } from "../ui";
import { prettifyNumber } from "../../helpers";
import { useI18n } from '../../components/contexts/I18nContext';

interface AccountItemProps {
	id: Account['_id']
}

export const AccountItem: React.FC<AccountItemProps> = ( { id } ) => {
	const { theme } = useTheme();
	const { __ } = useI18n();
	const { openMenu } = useMenu();
	const { openBottomSheet, closeBottomSheet } = useBottomSheet();
	const { account, saveAccount, removeAccount, balance, value } = useAccount( { id } )

	function onPress() {
		router.navigate( {
			pathname: 'accounts/[account]',
			params: {
				id: account._id.toString(),
				name: account.name
			}
		} );
	}

	const onLongPress = useCallback( ( { nativeEvent }: GestureResponderEvent ) => {
		const anchor = { x: nativeEvent.pageX, y: nativeEvent.pageY };
		const menuItems: MenuItem[] = [
			{
				title: __( 'Edit' ),
				leadingIcon: ( { color } ) => 
					<Icon name={ 'create' } color={ color } />,
				onPress: () => {
					openBottomSheet(
						__( 'Edit Account' ),
						<AccountForm
							account={ account }
							onSubmit={ ( editedAccount ) => {
								saveAccount( editedAccount ).then( closeBottomSheet );
							}	} />
					);
				}
			},
			{
				title: __( 'Remove' ),
				leadingIcon: ( { color } ) => 
					<Icon name={ 'trash' } color={ color } />,
				onPress: removeAccount
			}
		];

		openMenu( anchor, menuItems );
	}, [ account ] );

	const values = [
		<Value
			label={ __( 'Balance' ) }
			value={ prettifyNumber( balance, 0 ) }
			unit={ '€' }
			isVertical={ true }
			isNegative={ balance < 0 } />,
		<Value
			label={ __( 'Value' ) }
			value={ prettifyNumber( value, 0 ) }
			unit={ '€' }
			isVertical={ true }
			isNegative={ value < 0 } />,
	];

	if ( ! account?.isValid() ) return;

	const meta = [
		<Text style={ [ styles.name, { color: theme.colors.primary} ] }>{ account.name }</Text>
	];

	return (
		<TouchableRipple
			onPress={ onPress }
			onLongPress={ onLongPress }>
			<View style={ styles.container }>
				<View style={ styles.contentContainer }>
					<Grid
						columns={ 2 }
						items={ meta } />
					
					<Grid
						columns={ 4 }
						items= { values } />
				</View>

				<Icon name={ 'chevron-forward' } />
			</View>
		</TouchableRipple>
	)
}

export default AccountItem;

const styles = StyleSheet.create( {
	container: {
		...GlobalStyles.gutter,
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: Spacing.md,
		gap: Spacing.sm
	},
	contentContainer: {
		gap: Spacing.sm,
		flexGrow: 1
	},
	name: {
		fontWeight: FontWeight.bold,
	}
} );