import { apiVersion, dashboardQuery, dataset, projectId } from '../../abdimas-masjidulya/studio/content.mjs';

const dashboardUrl = new URL(`https://${projectId}.apicdn.sanity.io/v${apiVersion}/data/query/${dataset}`);
dashboardUrl.searchParams.set('query', dashboardQuery);
dashboardUrl.searchParams.set('perspective', 'published');

export async function readDashboardContent(signal) {
  const response = await fetch(dashboardUrl, { signal });
  if (!response.ok) throw new Error(`Sanity query failed (${response.status})`);
  const { result } = await response.json();
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    throw new Error('Sanity returned an invalid dashboard result');
  }
  return result;
}

export function dashboardImageUrl(image, localAsset) {
  const source = image?.src;
  if (!source) return undefined;
  if (source.startsWith(`https://cdn.sanity.io/images/${projectId}/${dataset}/`)) {
    return `${source}?auto=format&w=1200&fit=max`;
  }
  return source.includes(':') || source.startsWith('//') ? undefined : localAsset(source);
}
