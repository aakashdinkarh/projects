/**
 *
 * @param {string} tag - The HTML tag to create (e.g., 'div', 'a').
 * @param {string} className - The class to add to the element.
 * @param {string} content - The inner text content of the element.
 * @param {string} href - The href attribute if the element is a link.
 * @returns {HTMLElement} - The created HTML element.
 */
const getElement = (tag, className, content, href) => {
	const element = document.createElement(tag);

	if (className) element.className = className;

	if (content) {
		element.innerText = content;
	}

	if (tag === 'a' && href) {
		element.target = '_blank';
		element.href = href;
	}

	return element;
};

const snakeCaseToTitleCase = (string) => {
	try {
		return string
			.split('_')
			.map((word) => word[0].toUpperCase() + word.slice(1))
			.join(' ');
	} catch {
		return string;
	}
};

const getCurrentAppliedTags = () => {
	const params = new URLSearchParams(window.location.search);
	const appliedTags = decodeURIComponent(params.get('tags') || '').split(',').filter(Boolean);
	return appliedTags;
}

const setCurrentAppliedTags = (appliedTags) => {
	if (!appliedTags?.length) {
		window.history.replaceState({}, '', `${window.location.pathname}`);
		return;
	}
	const params = new URLSearchParams(window.location.search);
	params.set('tags', encodeURIComponent(appliedTags.join(',')));
	window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

const getProjectCard = (projectTitle, projectDescription, projectLinks) => {
	const projectCardElement = getElement('div', 'project-card');
	const projectTitleElement = getElement('h2', 'project-title', projectTitle);
	const projectDescriptionElement = getElement('p', 'project-description', projectDescription);
	const projectLinksElement = getElement('div', 'project-links');
	const links = projectLinks.map((linkDetails) => getElement('a', 'link', linkDetails.title, linkDetails.href));

	projectLinksElement.append(...links);
	projectCardElement.append(projectTitleElement, projectDescriptionElement, projectLinksElement);
	return projectCardElement;
};

async function getProjectDetails() {
	try {
		const res = await fetch('https://aakashdinkarh.github.io/static_assets/files/projects/project-details.json');
		return await res.json();
	} catch {
		return {};
	}
}

const getFilteredData = (data, appliedTags = []) => {
	const newData = {};

	const isAppliedTagsEmpty = appliedTags.length === 0;

	Object.keys(data).map((key) => {
		newData[key] = [];

		const projectDetails = data[key];
		projectDetails.forEach((projectDetail) => {
			if (projectDetail.hidden) return;

			const isAppliedTagExistInProject = isAppliedTagsEmpty || appliedTags.every((tag) => projectDetail.tags?.includes(tag));
			if(!isAppliedTagExistInProject) return;

			newData[key].push(projectDetail);
		})

	})

	return newData;
}

function renderData(data) {
	const renderDataElements = Object.keys(data).map((key) => {
		const fragment = document.createDocumentFragment();
		const sectionTitle = snakeCaseToTitleCase(key);
		const sectionTitleElement = getElement('h2', null, sectionTitle);
		const projectListElement = getElement('div', 'project-list');

		if (!data[key].length) {
			fragment.append(sectionTitleElement, getElement('i', 'no-results', 'No results here for applied filters. Try removing some filters'));
			return fragment;
		}

		const projectCards = data[key].map((projectDetails) => 
			getProjectCard(projectDetails.title, projectDetails.description, projectDetails.links)
		);
		projectListElement.append(...projectCards);

		fragment.append(sectionTitleElement, projectListElement);
		return fragment;
	});

	const mainElement = document.getElementsByTagName('main')?.[0];
	if (mainElement) {
		mainElement.replaceChildren(...renderDataElements);
	}
}

function renderFilteredData(appliedTags) {
	const filteredData = getFilteredData(window.__projectsData__, appliedTags);

	renderData(filteredData);
}

async function initProjectDetails() {
	const data = await getProjectDetails();
	const allProjects = Object.keys(data).flatMap((key) => data[key]);

	window.__projectsData__ = data;
	window.__uniqueTags__ = [...new Set(allProjects.flatMap(project => project.tags))];

	renderFilterTags();

	const appliedTags = getCurrentAppliedTags();
	renderFilteredData(appliedTags);
}

initProjectDetails();
