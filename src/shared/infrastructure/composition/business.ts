import "server-only";

import { BusinessService } from "@/modules/business/application/business-service";
import { DrizzleBusinessRepository } from "@/modules/business/infrastructure/drizzle-business-repository";
import { getEnvironment } from "@/shared/infrastructure/config/env";
import { database } from "@/shared/infrastructure/database/client";

const repository = new DrizzleBusinessRepository(database);

export const businessService = new BusinessService(repository, getEnvironment().BUSINESS_TIME_ZONE);
