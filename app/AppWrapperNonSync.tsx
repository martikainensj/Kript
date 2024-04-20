import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { RealmProvider } from '@realm/react';

import colors from './styles/colors';
import { AppNonSync } from './AppNonSync';

import { schemas } from './models';

export const AppWrapperNonSync = () => {
	// If sync is disabled, setup the app without any sync functionality and return early
	return (
		<SafeAreaView style={styles.screen}>
			<RealmProvider schema={schemas}>
				<AppNonSync />
			</RealmProvider>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: colors.darkBlue,
	},
});
