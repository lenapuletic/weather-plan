export type Activity = {
  icon: string;
  title: string;
};

export const SUGGESTED_ACTIVITY_COUNT = 4;

export function pickRandomActivities(
  activities: Activity[],
  count: number,
): Activity[] {
  if (activities.length <= count) {
    return [...activities];
  }
  const copy = [...activities];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = copy[i]!;
    copy[i] = copy[j]!;
    copy[j] = t;
  }
  return copy.slice(0, count);
}

export const ACTIVITIES_BY_WEATHER_STATE: Record<string, Activity[]> = {
  hot: [
    { icon: 'pool', title: 'Swimming' },
    { icon: 'icecream', title: 'Getting some ice cream' },
    { icon: 'beach_access', title: 'Heading to the beach' },
    { icon: 'kayaking', title: 'Kayaking or paddleboarding' },
    { icon: 'wb_sunny', title: 'Outdoor yoga or stretching' },
    { icon: 'nightlife', title: 'Rooftop drinks at sunset' },
  ],
  warm: [
    { icon: 'directions_bike', title: 'Cycling' },
    { icon: 'park', title: 'Picnic in the park' },
    { icon: 'restaurant', title: 'Lunch on a terrace' },
    { icon: 'storefront', title: 'Farmers market stroll' },
    { icon: 'local_florist', title: 'Botanical garden visit' },
    { icon: 'sports_soccer', title: 'Casual sports in the park' },
  ],
  cool: [
    { icon: 'hiking', title: 'Going for a hike' },
    { icon: 'camera_alt', title: 'Urban photography walk' },
    { icon: 'run_circle', title: 'Running' },
    { icon: 'museum', title: 'Gallery or museum afternoon' },
    { icon: 'sports_bar', title: 'Craft brewery tasting' },
    { icon: 'directions_walk', title: 'Self-guided city walk' },
  ],
  cold: [
    { icon: 'local_cafe', title: 'Visiting a cozy cafe' },
    { icon: 'museum', title: 'Visiting a museum' },
    { icon: 'book', title: 'Reading at home' },
    { icon: 'fitness_center', title: 'Indoor climbing or gym' },
    { icon: 'theater_comedy', title: 'Theater or comedy show' },
    { icon: 'spa', title: 'Spa or sauna session' },
  ],
  rainy: [
    { icon: 'movie', title: 'Movie marathon' },
    { icon: 'umbrella', title: 'Indoor shopping center' },
    { icon: 'sports_esports', title: 'Gaming session' },
    { icon: 'menu_book', title: 'Bookstore browsing' },
    { icon: 'dinner_dining', title: 'Long lunch with friends' },
    { icon: 'pets', title: 'Aquarium visit' },
  ],
  snowy: [
    { icon: 'ac_unit', title: 'Building a snowman' },
    { icon: 'downhill_skiing', title: 'Skiing or snowboarding' },
    { icon: 'fireplace', title: 'Hot chocolate indoors' },
    { icon: 'hiking', title: 'Snowshoeing trail' },
    { icon: 'ice_skating', title: 'Ice skating' },
    { icon: 'landscape', title: 'Winter landscape photography' },
  ],
};
