type MapVal = {
	isSensor: boolean;
};

class Store {
	data: Map<string, MapVal>;
	static instance?: Store;

	constructor() {
		this.data = new Map();
	}

	static getInstance() {
		if (!Store.instance) {
			Store.instance = new Store();
		}
		return Store.instance;
	}

	get(key: string) {
		return this.data.get(key);
	}

	set(key: string, value: MapVal) {
		this.data.set(key, value);
	}

	delete(key: string) {
		this.data.delete(key);
	}
}

export default Store.getInstance();
