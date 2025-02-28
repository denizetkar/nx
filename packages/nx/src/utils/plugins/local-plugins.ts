import * as chalk from 'chalk';
import { output } from '../output';
import type { PluginCapabilities } from './models';
import { hasElements } from './shared';
import { readJsonFile } from '../fileutils';
import { PackageJson, readNxMigrateConfig } from '../package-json';
import { ProjectsConfigurations } from '../../config/workspace-json-project-json';
import { join } from 'path';
import { workspaceRoot } from '../workspace-root';
import { existsSync } from 'fs';
import { ExecutorsJson, GeneratorsJson } from '../../config/misc-interfaces';
import { loadNxPlugin } from '../nx-plugin';
import { getNxRequirePaths } from '../installation-directory';
import { getPluginCapabilities } from './plugin-capabilities';

export function getLocalWorkspacePlugins(
  projectsConfiguration: ProjectsConfigurations
): Map<string, PluginCapabilities> {
  const plugins: Map<string, PluginCapabilities> = new Map();
  for (const project of Object.values(projectsConfiguration.projects)) {
    const packageJsonPath = join(workspaceRoot, project.root, 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson: PackageJson = readJsonFile(packageJsonPath);
      const capabilities = getPluginCapabilities(
        workspaceRoot,
        packageJson.name
      );
      if (
        capabilities.executors ||
        capabilities.generators ||
        capabilities.projectGraphExtension ||
        capabilities.projectInference
      ) {
        plugins.set(packageJson.name, {
          ...capabilities,
          name: packageJson.name,
        });
      }
    }
  }

  return plugins;
}

export function listLocalWorkspacePlugins(
  installedPlugins: Map<string, PluginCapabilities>
) {
  const bodyLines: string[] = [];

  for (const [, p] of installedPlugins) {
    const capabilities = [];
    if (hasElements(p.executors)) {
      capabilities.push('executors');
    }
    if (hasElements(p.generators)) {
      capabilities.push('generators');
    }
    bodyLines.push(`${chalk.bold(p.name)} (${capabilities.join()})`);
  }

  output.log({
    title: `Local workspace plugins:`,
    bodyLines: bodyLines,
  });
}
