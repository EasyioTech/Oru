import { AbilityBuilder, createMongoAbility, MongoAbility } from '@casl/ability';

type Action = 'read' | 'create' | 'update' | 'delete' | 'manage';
type Subject = 'AuditLog' | 'PlatformSetting' | 'AgencyProvisioning' | 'all';

export type AdminAbility = MongoAbility<[Action, Subject]>;

export function defineAdminAbilities(role: string): AdminAbility {
  const { can, cannot, build } = new AbilityBuilder<AdminAbility>(createMongoAbility);

  if (role === 'super_admin') {
    can('manage', 'all');
  } else {
    cannot('manage', 'all');
  }

  return build();
}
