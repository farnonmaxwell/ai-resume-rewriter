export type OwnerNotificationInput = {
  title: string;
  content: string;
};

export async function notifyOwner(input: OwnerNotificationInput): Promise<boolean> {
  console.info(`[JASS notification placeholder] ${input.title}: ${input.content}`);
  return false;
}
