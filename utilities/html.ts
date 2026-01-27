/** Template string function to enable tools to syntax-highlight the html string */
export const html = (strings: TemplateStringsArray, ...values: any[]) =>
	String.raw({ raw: strings }, ...values);

export function escapeHtml(text: string) {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}
