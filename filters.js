const getFilterTagElements = (uniqueTags = []) => {
  const initialAppliedFilterTags = getCurrentAppliedTags();

	const tags = uniqueTags.map((filterTag) => {
		const tagButton = getElement('button', 'filter-tag', filterTag);
    if (initialAppliedFilterTags.includes(filterTag)) {
      tagButton.classList.add('active');
    } 

		tagButton.onclick = () => {
      let appliedTags = getCurrentAppliedTags();

			if (appliedTags.includes(filterTag)) {
				appliedTags = appliedTags.filter((tag) => tag !== filterTag);
				tagButton.classList.remove('active');
			} else {
				appliedTags.push(filterTag);
				tagButton.classList.add('active');
			}

			renderFilteredData(appliedTags);
			setTimeout(setCurrentAppliedTags, 0, appliedTags);
		};

		return tagButton;
	});

	return tags;
};

function renderFilterTags() {
	const uniqueTags = window.__uniqueTags__;

	const filterTagElements = getFilterTagElements(uniqueTags);

	if (filterTagElements.length) {
		const filtersContainerElement = document.getElementById('filters');

		if (filtersContainerElement) {
			filtersContainerElement.append(...filterTagElements);
		}
	}
}
