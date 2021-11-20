import domready from "domready"
import SimplexNoise from "simplex-noise"
import "./style.css"
import Color from "./Color";

const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;
const DEG2RAD_FACTOR = TAU / 360;

const config = {
    width: 0,
    height: 0
};

/**
 * @type CanvasRenderingContext2D
 */
let ctx;
let canvas;

let noise;



function randomPoints()
{
    let pts = [];

    const { width, height } = config;

    for (let i = 0; i < 100; i++)
    {


        let x = Math.random() * width;
        let y = Math.random() * height;

        const hue = noise.noise3D(x * ns2 , y * ns2, 2) * 0.5 + 0.5;

        pts.push(
            x,
            y,
            Color.fromHSL(hue, 1, 0.2 + Math.random() * 0.6).mix(config.baseColor, 0.3).toRGBA(0.1 + Math.random() * 0.2)
        )
    }

    return pts

}

const ns = 0.003;
const ns2 = 0.0005;
const paintPerFrame = 50;

let maxCount;
let stop = false;

const black = Color.from("#000");



domready(
    () => {

        canvas = document.getElementById("screen");
        ctx = canvas.getContext("2d");

        const width = (window.innerWidth) | 0;
        const height = (window.innerHeight) | 0;

        config.width = width;
        config.height = height;

        canvas.width = width;
        canvas.height = height;

        let pts;
        let copy;

        let count = 0;
        let count2 = 100;
        let zOff = 0;

        const paint = () => {

            for (let i = 0; i < pts.length; i += 3 )
            {
                let x = pts[i];
                let y = pts[i + 1];
                let color = pts[i + 2];


                const dx = noise.noise3D(x * ns , y * ns, zOff);
                const dy = noise.noise3D(x * ns , y * ns,1 + zOff);

                let x2 = x + dx * 10;
                let y2 = y + dy * 10;

                if (x < 0 || x > width || y < 0 || y > height)
                {
                    x2 = Math.random() * width
                    y2 = Math.random() * height
                    continue;
                }

                ctx.strokeStyle = color;
                ctx.beginPath();
                ctx.moveTo(x,y);
                ctx.lineTo(x2,y2)
                ctx.stroke();

                pts[i] = x2;
                pts[i+1] = y2;

            }

            count++;
            if (count > maxCount)
            {
                if (count2-- < 0)
                {
                    stop = true;
                }

                count = 0;
                pts = copy.slice();

                zOff += ns * 3
            }
        }

        const anim = () => {
            for (let i=0; i < paintPerFrame; i++)
            {
                paint();
            }

            if (!stop)
            {
                requestAnimationFrame(anim)
            }
        }

        const init = () =>
        {
            noise = new SimplexNoise();

            const baseHue = Math.random();
            const baseColor = Color.fromHSL(baseHue, 1, 0.5);
            const baseColor2 = Color.fromHSL(baseHue + 0.5, 1, 0.5);

            config.baseColor = baseColor;

            ctx.fillStyle = baseColor2.mix(black, 0.9).toRGBHex();
            ctx.fillRect(0, 0, width, height);
            maxCount = 300 + Math.random() * 200

            stop = false;

            zOff = 0;
            count = 0;
            count2 = 0 | Math.random() * 40 + 80;

            pts = randomPoints();
            copy = pts.slice();

            requestAnimationFrame(anim)
        }

        init();

        window.addEventListener("click", init, true);
    }
);
