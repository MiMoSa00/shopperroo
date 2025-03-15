import { defineQuery } from "next-sanity";
import { sanityFetch } from "../live";

// function to gtet all categories
export const getAllCategories = async () => {
    const ALL_CATEGORIES_QUERY = defineQuery(`
    *[
        _type == "category"] | order(name asc)
        `);

        try {
            // use sanityfetch to send the query
            const categories = await sanityFetch({
                query: ALL_CATEGORIES_QUERY,
            });
            // return list of categories or empty array if none are found
            return categories.data || [];
        } catch (error) {
            console.error("Error fetching all categories:", error);
            return [];
        }
}