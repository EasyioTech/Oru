import { AbilityBuilder, createMongoAbility } from '@casl/ability';

export function defineNotificationsAbilities(role: string) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  // All roles can read, update, and delete their own notifications
  can('read', 'Notification');
  can('update', 'Notification');
  can('delete', 'Notification');

  return build();
}
