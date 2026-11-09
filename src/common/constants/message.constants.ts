import { find } from "rxjs"

export const generateMessage = (entity: string) => ({
    success: {
        create: `Successfully created ${entity}`,
        update: `Successfully updated ${entity}`,
        delete: `Successfully deleted ${entity}`,
    },
    failure: {
        find: `Failed to find ${entity}`,
        create: `Failed to create ${entity}`,
        update: `Failed to update ${entity}`,
        delete: `Failed to delete ${entity}`,
    },
})


export const SYS_MESSAGE = {
    USER: generateMessage('user'),
}