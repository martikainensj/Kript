import { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";

import { IconButton } from "../buttons";
import { DateInput, HoldingInput, TextInput } from "../inputs";
import { GlobalStyles, IconSize } from "../../constants";
import { __ } from "../../helpers";
import { Transaction } from "../../models/Transaction";
import { Holding } from "../../models/Holding";

interface TransactionFormProps {
	transaction: Transaction,
	holdings?: Holding[],
	onSubmit: ( transaction: Transaction ) => void;
}

export const TransactionForm = ( {
	transaction,
	holdings,
	onSubmit
}: TransactionFormProps ) => {
	const [ editedTransaction, setEditedTransaction ]
		= useState( { ...transaction } );

	useEffect( () => {
		setEditedTransaction( { ...transaction } );
	}, [ transaction ] );

	return (
		<View style={ styles.container }>
			<DateInput
				label={ __( 'Date' ) }
				value={ editedTransaction.date }
				setValue={ date => setEditedTransaction(
					Object.assign( { ...editedTransaction }, { date } )
				) } />
			{/*<HoldingInput
				label={ __( 'Holding' ) }
				value={ editedTransaction?.holding }
				holdings={ holdings ?? [] }
				placeholder={ `${ __( 'Example' ) }: Apple Inc` }
				setValue={ holding => setEditedTransaction(
					Object.assign( { ...editedTransaction }, { holding } )
				) } />*/}
			<TextInput
				label={ __( 'Price' ) }
				value={ editedTransaction?.price?.toString() }
				placeholder={ '0' }
				inputMode={ 'decimal' }
				onChangeText={ price => setEditedTransaction(
					Object.assign( { ...editedTransaction }, {
						price: price && parseFloat( price )
					} )
				) } />

			<TextInput
				label={ __( 'Amount' ) }
				value={ editedTransaction?.amount?.toString() }
				placeholder={ '0' }
				inputMode={ 'decimal' }
				onChangeText={ amount => setEditedTransaction(
					Object.assign( { ...editedTransaction }, {
						amount: amount && parseFloat( amount ) 
					} )
				) } />

			<TextInput
				label={ __( 'Total' ) }
				value={ editedTransaction?.total?.toString() }
				placeholder={ '0' }
				inputMode={ 'decimal' }
				onChangeText={ total => setEditedTransaction(
					Object.assign( { ...editedTransaction }, {
						total: total && parseFloat( total )
					} )
				) } />

			<TextInput
				label={ __( 'Notes' ) }
				value={ editedTransaction?.notes }
				placeholder={ `${ __( 'Enter notes here' ) }...` }
				onChangeText={ notes => setEditedTransaction(
					Object.assign( { ...editedTransaction }, { notes } )
				) }
				multiline={ true } />

			<IconButton
				icon={ 'save' }
				size={ IconSize.xl }
				style={ styles.submitButton }
				disabled={ ! editedTransaction }
				onPress={ onSubmit.bind( this, editedTransaction ) } />
		</View>
	)
}

const styles = StyleSheet.create( {
	container: {
		...GlobalStyles.form
	},
	submitButton: {
		alignSelf: 'flex-end'
	}
} );