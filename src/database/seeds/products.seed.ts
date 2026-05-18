import fs from "fs";
import csv from 'csv-parser';
import { finished } from "stream/promises";

interface rawProductData {
    id: string,
    price: number,
    model_segment_id: number,
    color: string,
    images_url: string[]
}

export async function loadProducts(jwtToken: string) {
    const rawData: rawProductData[] = [];

    const stream = fs.createReadStream('src/database/seeds/products.seed.csv')
        .pipe(csv())
        .on('data', (data) => {
            data.price = Number(data.price);
            data.model_segment_id = Number(data.model_segment_id);
            data.images_url = JSON.parse(data.images_url);

            rawData.push(data);
        });

    // await finish of stream
    await finished(stream);
    console.log("Raw Products Data:")

    for (const data of rawData) {
        try {
            await upload(data, jwtToken);
        } catch (error) {
            console.error(error);
            continue;
        }
    };
}

async function upload(rawData: rawProductData, jwtToken: string) {
    const form = new FormData();
    form.append("color", rawData.color);
    form.append("price", rawData.price.toString());
    form.append("modelSegmentId", rawData.model_segment_id.toString());

    // get images blobs
    await Promise.all(rawData.images_url.map(async element => {
        const result = await fetch(element);

        if (!result.ok) {
            const error = await result.json();
            throw new Error(JSON.stringify(error));
        }

        const blob = await result.blob();
        return form.append("files", blob);
    }));

    // upload product
    const res = await fetch('http://localhost:3000/products/create', {
        method: 'POST',
        body: form,
        headers: {
            Authorization: `Bearer ${jwtToken}`
        }
    })

    if (!res.ok) {
        const error = await res.json();
        throw new Error(JSON.stringify(error));
    }

    console.log("Product uploaded successful | ID = ", rawData.id);
}