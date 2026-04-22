import fs from "fs";
import csv from 'csv-parser';
import { finished } from "stream/promises";

interface rawModelSegmentData {
    id: string,
    model_id: number,
    segment: string,
}

export async function loadModelsSegments(jwtToken: string) {
    const rawData: rawModelSegmentData[] = [];

    const stream = fs.createReadStream('src/database/seeds/models-segments.seed.csv')
        .pipe(csv())
        .on('data', (data) => {
            data.model_id = Number(data.model_id);

            rawData.push(data);
        });

    // await finish of stream
    await finished(stream);
    console.log("Raw Models Segments Data:")
    console.log(rawData);

    for (const data of rawData) {
        try {
            await upload(data, jwtToken);
        } catch (error) {
            console.error(error);
            continue;
        }
    };
}

async function upload(rawData: rawModelSegmentData, jwtToken: string) {
    const dto = {
        modelId: rawData.model_id,
        segment: rawData.segment
    }

    // upload model
    const res = await fetch('http://localhost:3000/model-segments/create', {
        method: 'POST',
        body: JSON.stringify(dto),
        headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
        }
    })

    if (!res.ok) {
        const error = await res.json();
        throw new Error(JSON.stringify(error));
    }

    console.log("Model Segment uploaded successful | ID = ", rawData.id);
}