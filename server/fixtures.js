if (Categories.find().count() === 0) {
	Categories.insert({
		name: 'Museums'
	});
	Categories.insert({
		name: 'Japanese',
	});
	Categories.insert({
		name: 'Packaging and Shipping',
	});
}