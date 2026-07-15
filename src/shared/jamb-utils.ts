import { JambType, JambRequirement } from '../pages/side-pages/jamb-types/model';

export const metresRequired = (
    configuration: string | null | undefined,
    heightMm: number | null | undefined,
    requirements: JambRequirement[],
): number => {
    if (!configuration || !heightMm) return 0;
    const unitType = configuration === 'Single' || configuration.startsWith('Exterior Single') || configuration === 'Single Cavity'
        ? 'Single'
        : 'Pair';
    const match = requirements.find(r => r.unitType === unitType && r.heightMm === heightMm)
        ?? requirements.find(r => r.unitType === unitType);
    return match?.metresRequired ?? 0;
};

export const jambCostForItem = (
    jambType: JambType | undefined,
    configuration: string | null | undefined,
    heightMm: number | null | undefined,
    requirements: JambRequirement[],
): number => {
    if (!jambType || !jambType.costPerMetre) return 0;
    return jambType.costPerMetre * metresRequired(configuration, heightMm, requirements);
};
