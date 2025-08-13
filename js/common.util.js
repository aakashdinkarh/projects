export const isServer = () => {
  return typeof window === 'undefined' || window.document === undefined;
}
/**
 * Object to store and manage the promise for fetching project details.
 * Used to prevent multiple simultaneous fetch requests.
 * @type {{promise: Promise<{data: Object, allProjects: Array, uniqueTags: Array}>|null}}
 */
const fetchingPromise = {
	promise: null,
};
const fetchProjectDetails = (() => {
  let data;
  return async () => {
    if (data) return data;
    try {
      const res = await fetch(
        "https://aakashdinkarh.github.io/static_assets/files/projects/project-details.json"
      );
      const rawData = await res.json();
      const allProjects = Object.keys(rawData).flatMap((key) => rawData[key]);
      data = { data: rawData, allProjects, uniqueTags: [...new Set(allProjects.flatMap((project) => project.tags))] };
      return data;
    } catch {
      return { data: {}, allProjects: [] };
    }
  };
})();

export const getProjectDetails = async () => {
	if (fetchingPromise.promise) {
		return await fetchingPromise.promise;
	}
	fetchingPromise.promise = fetchProjectDetails();
	return await fetchingPromise.promise;
}

export const getCurrentAppliedTags = () => {
	try {
		const params = new URLSearchParams(window.location.search);
		const appliedTags = decodeURIComponent(params.get("tags") || "")
			.split(",")
			.filter(Boolean);
		return appliedTags;
	} catch {
		return [];
	}
};

export const snakeCaseToTitleCase = (string) => {
  try {
    return string
      .split("_")
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ");
  } catch {
    return string;
  }
};

export const setCurrentAppliedTags = (appliedTags) => {
  if (!appliedTags?.length) {
    window.history.replaceState({}, "", `${window.location.pathname}`);
    return;
  }
  const params = new URLSearchParams(window.location.search);
  params.set("tags", encodeURIComponent(appliedTags.join(",")));
  window.history.replaceState({}, "", `${window.location.pathname}?${params}`);
};

export const getFilteredData = (data, appliedTags = []) => {
  const newData = {};

  const isAppliedTagsEmpty = appliedTags.length === 0;

  Object.keys(data).map((key) => {
    newData[key] = [];

    const projectDetails = data[key];
    projectDetails.forEach((projectDetail) => {
      if (projectDetail.hidden) return;

      const isAppliedTagExistInProject =
        isAppliedTagsEmpty ||
        appliedTags.some((tag) => projectDetail.tags?.includes(tag));
      if (!isAppliedTagExistInProject) return;

      newData[key].push(projectDetail);
    });
  });

  return newData;
};
