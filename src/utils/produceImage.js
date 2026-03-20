import bananaImage from '../assets/produce/banana.svg'
import cabbageImage from '../assets/produce/cabbage.svg'
import cornImage from '../assets/produce/corn.svg'
import eggplantImage from '../assets/produce/eggplant.svg'
import genericProduceImage from '../assets/produce/generic-produce.svg'
import mangoImage from '../assets/produce/mango.svg'
import mongoImage from '../assets/produce/mongo.svg'
import onionImage from '../assets/produce/onion.svg'
import pineappleImage from '../assets/produce/pineapple.svg'
import riceImage from '../assets/produce/rice.svg'
import tomatoImage from '../assets/produce/tomato.svg'

const produceImageMap = [
  { test: /corn/i, image: cornImage },
  { test: /rice/i, image: riceImage },
  { test: /mongo|mung/i, image: mongoImage },
  { test: /mango/i, image: mangoImage },
  { test: /pineapple/i, image: pineappleImage },
  { test: /banana/i, image: bananaImage },
  { test: /cabbage/i, image: cabbageImage },
  { test: /tomato/i, image: tomatoImage },
  { test: /onion/i, image: onionImage },
  { test: /eggplant/i, image: eggplantImage },
]

export function getProduceFallbackImage(productName, fallback = genericProduceImage) {
  if (!productName) return fallback
  const normalized = String(productName).replace(/^DEMO\s+/i, '').trim()
  const match = produceImageMap.find((entry) => entry.test.test(normalized))
  return match ? match.image : fallback
}

export default getProduceFallbackImage
