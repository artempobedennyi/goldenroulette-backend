const getSlug = (name) => {
    return name.toLowerCase().replace(/ /g,"_")
};

export {
    getSlug,
};