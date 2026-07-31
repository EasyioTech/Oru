import { SearchCommand } from './SearchCommand';
import { FavoritesDropdown } from './FavoritesDropdown';
import { QuickCreateMenu } from './QuickCreateMenu';
import { SettingsPanel } from './SettingsPanel';
import { HealthAlert } from './HealthAlert';

export function DashboardHeaderBar() {
  return (
    <div className="flex items-center gap-2 px-6 py-3 bg-white border-b border-gray-200">
      {/* Left: Search */}
      <div className="flex-1">
        <SearchCommand />
      </div>

      {/* Right: Action buttons in row */}
      <div className="flex items-center gap-1">
        <FavoritesDropdown />
        <QuickCreateMenu />
        <HealthAlert />
        <SettingsPanel />
      </div>
    </div>
  );
}
