import { readFile } from 'node:fs/promises'

const campaignData = JSON.parse(
  await readFile(new URL('../../../lib/Trigma/campaign-catalog-v1.json', import.meta.url), 'utf8'),
) as { levels: readonly { level: number }[] }

export default {
  paths: campaignData.levels.map(({ level }) => ({
    params: {
      level: level.toString(),
    },
  })),
}
