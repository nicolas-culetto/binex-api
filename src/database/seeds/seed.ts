import { loadBrands } from "./brands.seed"
import { loadModelsSegments } from "./models-segments.seed";
import { loadModels } from "./models.seed";
import { loadProducts } from "./products.seed";
import { loadSizes } from "./sizes.seed";
import { config } from "dotenv";

config();

async function loadSeed() {
    const jwtToken = await getJwtToken();
    await loadBrands(jwtToken);
    await loadSizes(jwtToken);
    await loadModels(jwtToken);
    await loadModelsSegments(jwtToken);
    await loadProducts(jwtToken);
}

async function getJwtToken() {
    const email = process.env.ROOT_ADMIN_EMAIL as String;
    const password = process.env.ROOT_ADMIN_PASSWORD as String;

    const res = await fetch('http://localhost:3000/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if(!res.ok){
        const error = await res.json();
        throw new Error(JSON.stringify(error));
    }

    const {access_token} = await res.json();

    return access_token;
}

loadSeed();