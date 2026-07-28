import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAdaptiveNav } from '../hooks';
import { ChevronRight, Lock } from 'lucide-react';

interface AdaptiveNavigationProps {
  workspaceId?: string;
}

export function AdaptiveNavigation({ workspaceId }: AdaptiveNavigationProps) {
  const location = useLocation();
  const { activeModules, availableModules, disabledModules } = useAdaptiveNav(workspaceId);

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <nav className="space-y-4">
      {/* Active Modules - Prominent display */}
      {activeModules.length > 0 && (
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Active
          </h3>
          <div className="space-y-1">
            {activeModules.map((module) => (
              <Link
                key={module.id}
                to={module.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                  isActive(module.path)
                    ? 'bg-blue-100 text-blue-900'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{module.label}</span>
                {module.dataCount ? (
                  <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                    {module.dataCount}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Available Modules - Grayed out, clickable */}
      {availableModules.length > 0 && (
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Available
          </h3>
          <div className="space-y-1">
            {availableModules.map((module) => (
              <Link
                key={module.id}
                to={module.path}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                {module.label}
                <span className="text-xs text-gray-400">(No data)</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Disabled Modules - Locked */}
      {disabledModules.length > 0 && (
        <div>
          <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Disabled
          </h3>
          <div className="space-y-1">
            {disabledModules.map((module) => (
              <div
                key={module.id}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 flex items-center gap-2"
              >
                <Lock className="h-3 w-3" />
                {module.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
