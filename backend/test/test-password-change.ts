
import "reflect-metadata";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user.entity";
import { config } from "dotenv";
import * as bcrypt from "bcrypt";

// Load env
config({ path: "../../.env" });

async function testPasswordChange() {
    try {
        await AppDataSource.initialize();
        console.log("DB Connected");

        const userRepo = AppDataSource.getRepository(User);

        // 1. Find Admin
        const admin = await userRepo.findOne({ where: { email: 'admin@databuddy.com' } });
        if (!admin) {
            console.error("Admin not found");
            return;
        }
        console.log(`Found Admin: ${admin.id}`);
        console.log(`Current Hash starts with: ${admin.password ? admin.password.substring(0, 10) : 'null'}...`);

        // 2. Validate 'admin123'
        const isValid = await bcrypt.compare('admin123', admin.password);
        console.log(`Is 'admin123' valid? ${isValid}`);

        if (isValid) {
            // 3. Try to change password to 'admin1234'
            console.log("Attempting to change password to 'admin1234'...");

            // Simulate Service logic
            const newPass = 'admin1234';
            admin.password = newPass;

            await userRepo.save(admin);
            console.log("Saved.");

            // 4. Verify new password
            const updatedAdmin = await userRepo.findOne({ where: { email: 'admin@databuddy.com' } });
            console.log(`New Hash starts with: ${updatedAdmin?.password.substring(0, 10)}...`);
            const isNewValid = await bcrypt.compare('admin1234', updatedAdmin!.password);
            console.log(`Is 'admin1234' valid? ${isNewValid}`);

            // Revert back
            console.log("Reverting to 'admin123'...");
            updatedAdmin!.password = 'admin123';
            await userRepo.save(updatedAdmin!);
            console.log("Reverted.");
        } else {
            console.error("Original admin password 'admin123' is NOT valid!");
        }

    } catch (e) {
        console.error(e);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

testPasswordChange();
