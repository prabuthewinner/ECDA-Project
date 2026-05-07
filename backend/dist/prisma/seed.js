"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    const officerHash = await bcrypt.hash('password123', 10);
    const operatorHash = await bcrypt.hash('password123', 10);
    await prisma.user.upsert({
        where: { email: 'officer@example.com' },
        update: {},
        create: {
            email: 'officer@example.com',
            passwordHash: officerHash,
            name: 'Sarah Officer',
            role: client_1.Role.OFFICER,
        },
    });
    await prisma.user.upsert({
        where: { email: 'operator@example.com' },
        update: {},
        create: {
            email: 'operator@example.com',
            passwordHash: operatorHash,
            name: 'John Operator',
            role: client_1.Role.OPERATOR,
        },
    });
    const templates = [
        { sectionKey: 'business_details', text: 'Business registration number is missing or invalid.' },
        { sectionKey: 'business_details', text: 'Please provide a valid business address.' },
        { sectionKey: 'owner_info', text: 'NRIC/Passport copy is required for all directors.' },
        { sectionKey: 'owner_info', text: 'Owner contact details are incomplete.' },
        { sectionKey: 'premises_info', text: 'Floor plan of the premises is required.' },
        { sectionKey: 'premises_info', text: 'Tenancy agreement or proof of ownership is missing.' },
        { sectionKey: 'licence_details', text: 'Previous licence number must be provided for renewals.' },
        { sectionKey: null, text: 'Supporting documents are missing or illegible.' },
        { sectionKey: null, text: 'Please ensure all uploaded documents are in PDF or image format.' },
    ];
    for (const t of templates) {
        await prisma.commentTemplate.create({ data: t });
    }
    console.log('✅ Seed complete');
}
main()
    .catch((e) => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map