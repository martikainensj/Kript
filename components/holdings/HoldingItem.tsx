import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Text, TouchableRipple } from "react-native-paper";
import { router } from "expo-router";

import { FontWeight, GlobalStyles, Spacing } from "../../constants";
import { Holding } from "../../models/Holding";
import { prettifyNumber } from "../../helpers";
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from "../../contexts/ThemeContext";
import { Icon } from "../ui/Icon";
import { Value } from "../ui/Value";
import { Grid } from "../ui/Grid";
import { useAccount } from "../../contexts/AccountContext";

interface HoldingItemProps {
	holding: Holding
}

export const HoldingItem: React.FC<HoldingItemProps> = ( { holding } ) => {
	const { theme } = useTheme();
	const { __ } = useI18n();
	const { account } = useAccount();

	const onPress = useCallback( () => {
		router.push( `accounts/${ account._id.toString() }/${ holding._id.toString() }` );
	}, [ holding, account ] );

	if ( ! holding?.isValid() ) return;
	
	const { name, amount, value, returnValue, returnPercentage } = holding;

	const values = [
		<Value
			label={ __( 'Amount' ) }
			value={ prettifyNumber( amount ) }
			isVertical={ true } />,
		<Value
			label={ __( 'Value' ) }
			value={ prettifyNumber( value ) }
			unit={ '€' }
			isVertical={ true } />,
		<Value
			label={ __( 'Return' ) }
			value={ prettifyNumber( returnValue ) }
			unit={ '€' }
			isVertical={ true }
			isPositive={ returnValue > 0 }
			isNegative={ returnValue < 0 } />,
		<Value
			label={ __( 'Return' ) }
			value={ prettifyNumber( returnPercentage ) }
			unit={ '%' }
			isVertical={ true }
			isPositive={ returnPercentage > 0 }
			isNegative={ returnPercentage < 0 } />,
	];

	const meta = [
		<Text style={ [ styles.name, { color: theme.colors.primary } ] }>{ name }</Text>
	]
	
	return (
		<TouchableRipple onPress={ onPress }>
			<View style={ styles.container }>
				<View style={ styles.contentContainer }>
					<Grid
						columns={ 2 }
						items={ meta } />
					
					<Grid
						columns={ 4 }
						items= { values } />
				</View>

				<View style={ styles.iconContainer }>
					<Icon name={ 'chevron-forward' } />
				</View>
			</View>
		</TouchableRipple>
	)
}

export default HoldingItem;

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
		flexGrow: 1,
		flexShrink: 1
	},
	name: {
		fontWeight: FontWeight.bold,
	},
	iconContainer: {
	}
} );