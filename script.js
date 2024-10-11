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

async function renderProjectDetails() {
	const data = await getProjectDetails();

	const renderDataElements = Object.keys(data).map((key) => {
		const fragment = document.createDocumentFragment();
		const sectionTitle = snakeCaseToTitleCase(key);
		const sectionTitleElement = getElement('h2', null, sectionTitle);
		const projectListElement = getElement('div', 'project-list');
		const projectCards = data[key].map((projectDetails) =>
			getProjectCard(projectDetails.title, projectDetails.description, projectDetails.links)
		);
		projectListElement.append(...projectCards);

		fragment.append(sectionTitleElement, projectListElement);
		return fragment;
	});

	const mainElement = document.getElementsByTagName('main')?.[0];
	if (mainElement) {
		mainElement.append(...renderDataElements);
	}
}

renderProjectDetails();
