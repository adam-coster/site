export function dateToIso(date: string | Date) {
	return new Date(date).toISOString();
}
