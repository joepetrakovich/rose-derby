
/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
    return {
        index: params.index
    };
}