import { Plan } from "../schema/tenant.js";


export const Unlimited = -1;

export interface PlanLimit {
    maxApiKey: number;
    maxPages: number;
    maxQueries: number;
}

export const planLimits:Record<Plan,PlanLimit> = {
    [Plan.FREE]: {
        maxApiKey: 1,
        maxPages: 50,
        maxQueries: 90
    },
    [Plan.PRO]: {
        maxApiKey: 5,
        maxPages: 350,
        maxQueries: 480
    },
    [Plan.ENTERPRISE]: {
        maxApiKey: Unlimited,
        maxPages: Unlimited,
        maxQueries: Unlimited
    }
}

export const isUnlimited = (value: number): boolean => value === Unlimited;
