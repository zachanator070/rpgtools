db.serverconfigs.insertOne({
	_id: ObjectId("5e684f4dd6c5e7002df5cf01"),
	registerCodes: [],
	unlockCode: "90b678e9-4e1c-41e4-97c1-f4a56aba781a",
	version: "1.0",
	__v: 1,
});

db.permissionassignments.insertMany([
	{
		_id: ObjectId("5f51c9b0bb72910053e0dac6"),
		permission: "Create world access",
		subject: ObjectId("5e684f4dd6c5e7002df5cf01"),
		subjectType: "ServerConfig",
		__v: 0,
	},
	{
		_id: ObjectId("5f51ca14bb72910053e0dace"),
		permission: "Able to change permissions for all worlds",
		subject: ObjectId("5e684f4dd6c5e7002df5cf01"),
		subjectType: "ServerConfig",
		__v: 0,
	},
	{
		_id: ObjectId("5f51ca14bb72910053e0dad0"),
		permission: "Able to read all worlds",
		subject: ObjectId("5e684f4dd6c5e7002df5cf01"),
		subjectType: "ServerConfig",
		__v: 0,
	},
	{
		_id: ObjectId("5f51ca14bb72910053e0dad2"),
		permission: "Able to write to any world",
		subject: ObjectId("5e684f4dd6c5e7002df5cf01"),
		subjectType: "ServerConfig",
		__v: 0,
	},
	{
		_id: ObjectId("5f51ca14bb72910053e0dad4"),
		permission: "Able to change permissions for this server",
		subject: ObjectId("5e684f4dd6c5e7002df5cf01"),
		subjectType: "ServerConfig",
		__v: 0,
	},
	{
		_id: ObjectId("5f51ca14bb72910053e0dad6"),
		permission: "Able to edit this server",
		subject: ObjectId("5e684f4dd6c5e7002df5cf01"),
		subjectType: "ServerConfig",
		__v: 0,
	},
]);
db.roles.insertOne({
	_id: ObjectId("5f51ca14bb72910053e0dacb"),
	permissions: [
		ObjectId("5f51c9b0bb72910053e0dac6"),
		ObjectId("5f51ca14bb72910053e0dace"),
		ObjectId("5f51ca14bb72910053e0dad0"),
		ObjectId("5f51ca14bb72910053e0dad2"),
		ObjectId("5f51ca14bb72910053e0dad4"),
		ObjectId("5f51ca14bb72910053e0dad6"),
	],
	name: "Server Admin",
	__v: 1,
});
db.users.insertOne({
	_id: ObjectId("5f51ca14bb72910053e0daca"),
	roles: [ObjectId("5f51ca14bb72910053e0dacb")],
	permissions: [],
	email: "zach@thezachcave.com",
	username: "zach",
	password: "$2b$10$d/XQLrdOZrbSP754yDIhGuOjZMN7/HcINc26HPmQ7JadNZFWFSRCS",
	__v: 1,
	tokenVersion: "cfec71da-4934-420a-b3a0-66e0dda4da88",
});

db.users.insertOne({
	_id: ObjectId("5f4f29217c775800d9125a73"),
	roles: [],
	permissions: [],
	email: "bob@thezachcave.com",
	username: "bob",
	password: "$2b$10$37yFe/MVIQEaxsou8TXGUONupaBK8TU.xNrzZka.zcM4bZHCUUdyq",
	__v: 0,
});
