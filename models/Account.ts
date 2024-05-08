import { Object, BSON, List } from 'realm';
import { Holding } from './Holding';
import { Transaction } from './Transaction';

export type AccountType = {
  _id?: BSON.ObjectId;
  owner_id: string;
  name: string;
  notes?: string;
	holdings?: Holding[];
	transactions?: Transaction[];
};

export class Account extends Object<AccountType> {
  _id: BSON.ObjectId = new BSON.ObjectId();
  owner_id!: string;
  name!: string;
  notes?: string;
	hodlings?: Holding[];
	transactions?: Transaction[];

	static primaryKey = '_id';
}
