import debug from 'debug'
import { basename } from 'path'

import { mergeConfigs, PluginConfig } from './injectedConfig'
import { EnvInfo } from './io/envInfo'
import { Fs } from './io/fs'
import { PluginLoader } from './load'

const EARL_PLUGIN_NAME_REGEXP = /^earljs-plugin-(.*)$/

const logger = debug('earl:plugins:autoload')

export async function autoloadPlugins({
  envInfo,
  fs,
  loadPlugin,
}: {
  envInfo: EnvInfo
  fs: Fs
  loadPlugin: PluginLoader
}): Promise<PluginConfig> {
  const nodeModulesPaths = envInfo.findNodeModules()

  const pluginInjectedConfigs = await autoloadPluginsFromDir({ fs, loadPlugin }, nodeModulesPaths)

  return mergeConfigs(pluginInjectedConfigs)
}

export async function autoloadPluginsFromDir(
  { fs, loadPlugin }: { fs: Fs; loadPlugin: PluginLoader },
  dir: string,
): Promise<PluginConfig[]> {
  logger(`Loading plugins from: ${dir}`)
  const plugins = findPluginsInDir({ fs }, dir)
  logger(`Loading plugins from: ${dir}. Found ${plugins.length} plugins`)

  const pluginInjectedConfigs = []
  for (const plugin of plugins) {
    pluginInjectedConfigs.push(await loadPlugin(plugin))
  }

  return pluginInjectedConfigs
}

export function findPluginsInDir({ fs }: { fs: Fs }, dir: string): string[] {
  const files = fs.listDir(dir)

  const plugins = files.filter((filePath) => {
    const name = basename(filePath)
    return EARL_PLUGIN_NAME_REGEXP.test(name)
  })

  return plugins
}