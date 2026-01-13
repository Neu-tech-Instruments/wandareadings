import { Review } from '../../types';

export const getDailyReviews = (allReviews: Review[]): Review[] => {
    const today = new Date();
    const dateString = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }); // "12 Jan 2026"
    const seedString = today.toISOString().split('T')[0]; // "2026-01-12"

    // Simple pseudo-random generator
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
        const char = seedString.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0;
    }
    const random = () => {
        const x = Math.sin(hash++) * 10000;
        return x - Math.floor(x);
    };

    const fiveStar = allReviews.filter(r => r.rating === 5);
    const fourPointFiveStar = allReviews.filter(r => r.rating === 4.5);
    console.log('Rotator Debug:', {
        fiveStarCount: fiveStar.length,
        fourPointFiveStarCount: fourPointFiveStar.length,
        allCount: allReviews.length,
        sampleRating: allReviews[4]?.rating // ID 5
    });

    // Select 2 unique 5-star reviews
    const selectedFiveStars: Review[] = [];
    const fiveStarPool = [...fiveStar];
    for (let i = 0; i < 2; i++) {
        if (fiveStarPool.length === 0) break;
        const index = Math.floor(random() * fiveStarPool.length);
        selectedFiveStars.push(fiveStarPool[index]);
        fiveStarPool.splice(index, 1); // remove from pool to avoid duplicates
    }

    // Select 1 4.5-star review
    const selectedFourPointFiveStars: Review[] = [];
    const fourPointFiveStarPool = [...fourPointFiveStar];
    if (fourPointFiveStarPool.length > 0) {
        const index = Math.floor(random() * fourPointFiveStarPool.length);
        selectedFourPointFiveStars.push(fourPointFiveStarPool[index]);
    }

    // Create featured list with current date: 5, 5, 4.5
    const featured = [...selectedFiveStars, ...selectedFourPointFiveStars].map(review => ({
        ...review,
        date: dateString,
        id: -review.id // Avoid ID collisions if review appears twice (original remains in list)
    }));

    // Remaining reviews (excluding the source IDs of the featured ones)
    const featuredSourceIds = new Set([...selectedFiveStars, ...selectedFourPointFiveStars].map(r => r.id));
    const remainingReviews = allReviews.filter(r => !featuredSourceIds.has(r.id));

    return [...featured, ...remainingReviews];
};
