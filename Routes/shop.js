const express = require('express');
const router = express.Router();


const Products = require('../models/Products');


router.post('/Addproducts', async (req, res) => {
    try {
        for (let i = 0; i < req.body.length; i++) {

            const p = new Products({
                prod_name: req.body[i].prod_name,
                desc: req.body[i].desc,
                category: req.body[i].category,
                slug: req.body[i].slug,
                size: req.body[i].size,
                avail_Qty: req.body[i].avail_Qty,
                color: req.body[i].color
            })
            p.save();
        }

        res.send("success")
    } catch (error) {

        res.status(500).send({ Error: error.message })

    }

})

router.get('/Getproducts', async (req, res) => {
    try {
        const all_prods = await Products.find({ category: "T-Shirt" });

        // res.json({all_prods});

        const tshirts = {}

        for (item of all_prods) {

            if (item.prod_name in tshirts) {
                if ((!tshirts[item.prod_name].color.includes(item.color)) && item.avail_Qty > 0) {
                    tshirts[item.prod_name].color.push(item.color)
                }
                if (!tshirts[item.prod_name].size.includes(item.size) && item.avail_Qty > 0) {
                    tshirts[item.prod_name].size.push(item.size)
                }
            }
            else {
                tshirts[item.prod_name] = JSON.parse(JSON.stringify(item))
                // tshirts[item.prod_name] = item
                
                if(item.avail_Qty > 0)
                {
                    tshirts[item.prod_name].color = [item.color]
                    tshirts[item.prod_name].size = [item.size]
                }
                else{
                    tshirts[item.prod_name].color = []
                    tshirts[item.prod_name].size = []
                }

                // tshirts[item.prod_name].color = [item.color]
                // tshirts[item.prod_name].size = [item.size]

            }
        }
        res.json({ tshirts });



    } catch (error) {
        // res.send(error.message)
        res.status(500).send({ Error: "Internal server error", reason: error.message })
    }
})


router.get('/getsingleproduct/:slug', async (req, res) => {
    try {
        // console.log(req.params.slug)

        const product = await Products.findOne({ slug: req.params.slug })


        const varaints = await Products.find({ prod_name: product.prod_name })

        // console.log(product)

        const colorSizeSlug = {};

        for(item of varaints){

            if(Object.keys(colorSizeSlug).includes(item.color)){
                colorSizeSlug[item.color][item.size] = {slug:item.slug}
            }
            else{
                colorSizeSlug[item.color] = {}
                colorSizeSlug[item.color][item.size] = {slug:item.slug}
            }
        }

        // if(Object.keys(colorSizeSlug['red'][item.size]).includes('red')){
        //     console.log()
        //     res.json({colorSizeSlug})
        // }
        // if(Object.keys(colorSizeSlug['red']).includes('M')){
            
        //     res.send('M size available in red color')
        // }
        // if(Object.keys(colorSizeSlug['red']).includes('S')){
            
        //     // res.send('S size available in red color')
        // }
        res.send(Object.keys(colorSizeSlug.red))
        // res.send(colorSizeSlug.red["M"].slug)

    } catch (error) {
        res.status(500).send({ Error: "Internal server error ", Reason: error.message })
    }
})

module.exports = router