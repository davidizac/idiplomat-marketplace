/**
 * List of popular Israeli cities for address/location selection
 */
export const ISRAELI_CITIES = [
	"Jerusalem",
	"Tel Aviv",
	"Haifa",
	"Rishon LeZion",
	"Petah Tikva",
	"Ashdod",
	"Netanya",
	"Beer Sheva",
	"Holon",
	"Bnei Brak",
	"Ramat Gan",
	"Ashkelon",
	"Rehovot",
	"Bat Yam",
	"Beit Shemesh",
	"Kfar Saba",
	"Herzliya",
	"Hadera",
	"Modi'in",
	"Nazareth",
] as const;

export type IsraeliCity = (typeof ISRAELI_CITIES)[number];
