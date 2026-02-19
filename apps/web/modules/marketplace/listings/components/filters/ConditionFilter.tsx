"use client";

import { Label } from "@ui/components/label";
import { useTranslations } from "next-intl";

interface ConditionFilterProps {
	onChange: (conditions: string[]) => void;
	selectedConditions: string[];
}

interface Condition {
	id: string;
	name: string;
}

export const conditions: Condition[] = [
	{ id: "new", name: "New" },
	{ id: "like-new", name: "Like New" },
	{ id: "good", name: "Good" },
	{ id: "fair", name: "Fair" },
];

const conditionTranslationKeys: Record<string, string> = {
	new: "conditionNew",
	"like-new": "conditionLikeNew",
	good: "conditionGood",
	fair: "conditionFair",
};

export function ConditionFilter({
	onChange,
	selectedConditions,
}: ConditionFilterProps) {
	const t = useTranslations("marketplace.filters");
	const handleChange = (conditionId: string) => {
		if (selectedConditions.includes(conditionId)) {
			onChange(selectedConditions.filter((id) => id !== conditionId));
		} else {
			onChange([...selectedConditions, conditionId]);
		}
	};

	return (
		<div className="space-y-4">
			<h3 className="font-semibold">{t("condition")}</h3>
			<div className="space-y-2">
				{conditions.map((condition) => (
					<div
						key={condition.id}
						className="flex items-center space-x-2"
					>
						<input
							id={condition.id}
							type="checkbox"
							className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
							checked={selectedConditions.includes(condition.id)}
							onChange={() => handleChange(condition.id)}
						/>
						<Label htmlFor={condition.id}>{t(conditionTranslationKeys[condition.id] || condition.name)}</Label>
					</div>
				))}
			</div>
		</div>
	);
}
