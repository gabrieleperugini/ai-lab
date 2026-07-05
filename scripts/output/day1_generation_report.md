# Day 1 generation report

model: `gpt2`

## M1 next-token examples

### once_upon: `Once upon a`

| candidate | tokens | probability | rank |
|---|---|---|---|
| time | 1 ([' time']) | 0.1766 | 1 |
| day | 1 ([' day']) | 0.0027 | 32 |
| night | 1 ([' night']) | 0.0018 | 53 |
| place | 1 ([' place']) | 0.0010 | 111 |
| story | 1 ([' story']) | 0.0002 | 424 |
| certain* | 1 ([' certain']) | 0.0845 | 2 |
| moment* | 1 ([' moment']) | 0.0312 | 3 |

other mass: 0.7019

### happy_birthday: `Happy birthday to`

| candidate | tokens | probability | rank |
|---|---|---|---|
| you | 1 ([' you']) | 0.1869 | 1 |
| me | 1 ([' me']) | 0.0649 | 3 |
| her | 1 ([' her']) | 0.0038 | 16 |
| him | 1 ([' him']) | 0.0041 | 14 |
| everyone | 1 ([' everyone']) | 0.0245 | 6 |
| my* | 1 ([' my']) | 0.1231 | 2 |
| the* | 1 ([' the']) | 0.0586 | 4 |

other mass: 0.5340

### end_of_day: `At the end of the day,`

| candidate | tokens | probability | rank |
|---|---|---|---|
| the | 1 ([' the']) | 0.0854 | 3 |
| I | 1 ([' I']) | 0.1025 | 1 |
| it | 1 ([' it']) | 0.1020 | 2 |
| we | 1 ([' we']) | 0.0705 | 4 |
| everything | 1 ([' everything']) | 0.0015 | 56 |
| you* | 1 ([' you']) | 0.0436 | 5 |
| this* | 1 ([' this']) | 0.0383 | 6 |

other mass: 0.5562

### better_late: `Better late than`

| candidate | tokens | probability | rank |
|---|---|---|---|
| never | 1 ([' never']) | 0.1480 | 3 |
| sorry | 1 ([' sorry']) | 0.0008 | 68 |
| late | 1 ([' late']) | 0.0019 | 38 |
| early | 1 ([' early']) | 0.0016 | 42 |
| nothing | 1 ([' nothing']) | 0.0008 | 70 |
| expected* | 1 ([' expected']) | 0.1791 | 1 |
| you* | 1 ([' you']) | 0.1717 | 2 |

other mass: 0.4961

### capital_france: `The capital of France is`

| candidate | tokens | probability | rank |
|---|---|---|---|
| Paris | 1 ([' Paris']) | 0.0322 | 5 |
| Berlin | 1 ([' Berlin']) | 0.0016 | 68 |
| Rome | 1 ([' Rome']) | 0.0028 | 37 |
| London | 1 ([' London']) | 0.0021 | 49 |
| Madrid | 1 ([' Madrid']) | 0.0016 | 67 |
| the* | 1 ([' the']) | 0.0846 | 1 |
| now* | 1 ([' now']) | 0.0479 | 2 |

other mass: 0.8271

### largest_planet: `The largest planet in the Solar System is`

| candidate | tokens | probability | rank |
|---|---|---|---|
| Jupiter | 1 ([' Jupiter']) | 0.0244 | 6 |
| Saturn | 1 ([' Saturn']) | 0.0229 | 7 |
| Earth | 1 ([' Earth']) | 0.0225 | 8 |
| Mars | 1 ([' Mars']) | 0.0175 | 9 |
| Venus | 1 ([' Venus']) | 0.0029 | 56 |
| about* | 1 ([' about']) | 0.0922 | 1 |
| the* | 1 ([' the']) | 0.0713 | 2 |

other mass: 0.7463

### water_freezes: `Water freezes at zero degrees`

| candidate | tokens | probability | rank |
|---|---|---|---|
| Celsius | 1 ([' Celsius']) | 0.1474 | 2 |
| Fahrenheit | 1 ([' Fahrenheit']) | 0.1425 | 3 |
| Kelvin | 1 ([' Kelvin']) | 0.0039 | 18 |
| centigrade | 3 ([' cent', 'igr', 'ade']) | 0.0042 | phrase |
| below | 1 ([' below']) | 0.0080 | 13 |
| for* | 1 ([' for']) | 0.1008 | 4 |
| and* | 1 ([' and']) | 0.0258 | 8 |

other mass: 0.5674

### world_cup: `The capital of the country that hosted the World Cup in 1998 is`

| candidate | tokens | probability | rank |
|---|---|---|---|
| Paris | 1 ([' Paris']) | 0.0009 | 140 |
| Berlin | 1 ([' Berlin']) | 0.0012 | 106 |
| London | 1 ([' London']) | 0.0029 | 37 |
| Rome | 1 ([' Rome']) | 0.0027 | 39 |
| Madrid | 1 ([' Madrid']) | 0.0016 | 73 |
| now* | 1 ([' now']) | 0.1597 | 1 |
| the* | 1 ([' the']) | 0.0672 | 2 |

other mass: 0.7639

### bank_money: `I walked to the bank and deposited some`

| candidate | tokens | probability | rank |
|---|---|---|---|
| money | 1 ([' money']) | 0.3984 | 1 |
| cash | 1 ([' cash']) | 0.1501 | 2 |
| checks | 1 ([' checks']) | 0.0093 | 9 |
| coins | 1 ([' coins']) | 0.0439 | 5 |
| documents | 1 ([' documents']) | 0.0003 | 133 |
| of* | 1 ([' of']) | 0.0457 | 4 |
| notes* | 1 ([' notes']) | 0.0256 | 6 |

other mass: 0.3266

### bank_river: `The fisherman stood on the bank of the`

| candidate | tokens | probability | rank |
|---|---|---|---|
| river | 1 ([' river']) | 0.1607 | 1 |
| lake | 1 ([' lake']) | 0.0154 | 4 |
| stream | 1 ([' stream']) | 0.0083 | 11 |
| water | 1 ([' water']) | 0.0023 | 62 |
| sea | 1 ([' sea']) | 0.0032 | 46 |

other mass: 0.8101

### bat_baseball: `The baseball player swung the bat and hit the`

| candidate | tokens | probability | rank |
|---|---|---|---|
| ball | 1 ([' ball']) | 0.1753 | 2 |
| pitch | 1 ([' pitch']) | 0.0070 | 13 |
| fence | 1 ([' fence']) | 0.0045 | 25 |
| ground | 1 ([' ground']) | 0.1798 | 1 |
| catcher | 1 ([' catcher']) | 0.0101 | 9 |
| wall* | 1 ([' wall']) | 0.0283 | 3 |
| pitcher* | 1 ([' pitcher']) | 0.0178 | 4 |

other mass: 0.5772

### bat_cave: `At sunset, the bat flew out of the`

| candidate | tokens | probability | rank |
|---|---|---|---|
| cave | 1 ([' cave']) | 0.0052 | 17 |
| tree | 1 ([' tree']) | 0.0182 | 5 |
| attic | 1 ([' attic']) | 0.0003 | 302 |
| darkness | 1 ([' darkness']) | 0.0045 | 22 |
| shadows | 1 ([' shadows']) | 0.0041 | 24 |
| sky* | 1 ([' sky']) | 0.3186 | 1 |
| air* | 1 ([' air']) | 0.0325 | 2 |

other mass: 0.6167

### umbrella: `The sky became dark and full of clouds, so I took my`

| candidate | tokens | probability | rank |
|---|---|---|---|
| umbrella | 1 ([' umbrella']) | 0.0045 | 33 |
| coat | 1 ([' coat']) | 0.0090 | 18 |
| jacket | 1 ([' jacket']) | 0.0013 | 121 |
| camera | 1 ([' camera']) | 0.0043 | 37 |
| keys | 1 ([' keys']) | 0.0007 | 209 |
| hat* | 1 ([' hat']) | 0.0325 | 1 |
| clothes* | 1 ([' clothes']) | 0.0237 | 2 |

other mass: 0.9240

### restaurant: `The waiter handed us the menu and asked what we wanted to`

| candidate | tokens | probability | rank |
|---|---|---|---|
| order | 1 ([' order']) | 0.1568 | 2 |
| eat | 1 ([' eat']) | 0.2895 | 1 |
| drink | 1 ([' drink']) | 0.0231 | 8 |
| try | 1 ([' try']) | 0.0389 | 5 |
| have | 1 ([' have']) | 0.0150 | 12 |
| do* | 1 ([' do']) | 0.1295 | 3 |
| see* | 1 ([' see']) | 0.0513 | 4 |

other mass: 0.2960

### breakfast_federico: `For breakfast, Federico usually eats`

| candidate | tokens | probability | rank |
|---|---|---|---|
| cereal | 1 ([' cereal']) | 0.0009 | 113 |
| eggs | 1 ([' eggs']) | 0.0034 | 42 |
| toast | 1 ([' toast']) | 0.0015 | 73 |
| croissants | 3 ([' cro', 'iss', 'ants']) | 0.0000 | phrase |
| pasta | 1 ([' pasta']) | 0.0037 | 38 |
| a* | 1 ([' a']) | 0.1914 | 1 |
| two* | 1 ([' two']) | 0.0491 | 2 |

other mass: 0.7499

### breakfast_friedrich: `For breakfast, Friedrich usually eats`

| candidate | tokens | probability | rank |
|---|---|---|---|
| cereal | 1 ([' cereal']) | 0.0010 | 102 |
| eggs | 1 ([' eggs']) | 0.0045 | 35 |
| toast | 1 ([' toast']) | 0.0017 | 67 |
| bread | 1 ([' bread']) | 0.0058 | 27 |
| sausage | 1 ([' sausage']) | 0.0003 | 315 |
| a* | 1 ([' a']) | 0.1801 | 1 |
| two* | 1 ([' two']) | 0.0531 | 2 |

other mass: 0.7535

### student_test: `The student opened the test and realized`

| candidate | tokens | probability | rank |
|---|---|---|---|
| that | 1 ([' that']) | 0.3395 | 1 |
| she | 1 ([' she']) | 0.0934 | 3 |
| he | 1 ([' he']) | 0.2003 | 2 |
| it | 1 ([' it']) | 0.0497 | 5 |
| what | 1 ([' what']) | 0.0251 | 7 |
| the* | 1 ([' the']) | 0.0540 | 4 |
| his* | 1 ([' his']) | 0.0342 | 6 |

other mass: 0.2037

### library: `In the library, everyone started to`

| candidate | tokens | probability | rank |
|---|---|---|---|
| whisper | 1 ([' whisper']) | 0.0001 | 717 |
| read | 1 ([' read']) | 0.0116 | 16 |
| study | 1 ([' study']) | 0.0014 | 103 |
| talk | 1 ([' talk']) | 0.0312 | 3 |
| laugh | 1 ([' laugh']) | 0.0009 | 146 |
| get* | 1 ([' get']) | 0.0503 | 1 |
| see* | 1 ([' see']) | 0.0438 | 2 |

other mass: 0.8607

### algebra: `A number is multiplied by 5. Then 10 is added. The result is 20. Therefore, the original number was`

| candidate | tokens | probability | rank |
|---|---|---|---|
| 1 | 1 ([' 1']) | 0.0369 | 4 |
| 2 | 1 ([' 2']) | 0.0213 | 8 |
| 3 | 1 ([' 3']) | 0.0209 | 9 |
| 4 | 1 ([' 4']) | 0.0187 | 11 |
| 5 | 1 ([' 5']) | 0.0382 | 3 |

other mass: 0.8640

### trophy: `The trophy would not fit into the suitcase because it was too`

| candidate | tokens | probability | rank |
|---|---|---|---|
| big | 1 ([' big']) | 0.2121 | 2 |
| large | 1 ([' large']) | 0.1886 | 3 |
| small | 1 ([' small']) | 0.2134 | 1 |
| heavy | 1 ([' heavy']) | 0.0942 | 4 |
| old | 1 ([' old']) | 0.0033 | 22 |
| long* | 1 ([' long']) | 0.0342 | 5 |
| close* | 1 ([' close']) | 0.0171 | 6 |

other mass: 0.2370

### oven: `He put the ice cream in the oven and it`

| candidate | tokens | probability | rank |
|---|---|---|---|
| melted | 1 ([' melted']) | 0.0306 | 6 |
| burned | 1 ([' burned']) | 0.0038 | 31 |
| froze | 1 ([' froze']) | 0.0074 | 18 |
| disappeared | 1 ([' disappeared']) | 0.0009 | 87 |
| cooled | 1 ([' cooled']) | 0.0042 | 28 |
| was* | 1 ([' was']) | 0.3552 | 1 |
| came* | 1 ([' came']) | 0.0517 | 2 |

other mass: 0.5462

### freezer: `He put the ice cream in the freezer and it`

| candidate | tokens | probability | rank |
|---|---|---|---|
| froze | 1 ([' froze']) | 0.0266 | 6 |
| melted | 1 ([' melted']) | 0.0162 | 11 |
| cooled | 1 ([' cooled']) | 0.0067 | 22 |
| hardened | 1 ([' hardened']) | 0.0003 | 191 |
| disappeared | 1 ([' disappeared']) | 0.0018 | 58 |
| was* | 1 ([' was']) | 0.3193 | 1 |
| came* | 1 ([' came']) | 0.0462 | 2 |

other mass: 0.5829

### syllogism: `All cats are mammals. Luna is a cat. Therefore, Luna is a`

| candidate | tokens | probability | rank |
|---|---|---|---|
| mammal | 1 ([' mammal']) | 0.0571 | 2 |
| cat | 1 ([' cat']) | 0.1875 | 1 |
| dog | 1 ([' dog']) | 0.0167 | 6 |
| planet | 1 ([' planet']) | 0.0003 | 435 |
| person | 1 ([' person']) | 0.0099 | 9 |
| human* | 1 ([' human']) | 0.0469 | 3 |
| species* | 1 ([' species']) | 0.0212 | 4 |

other mass: 0.6605

## M3 branching trees

### student_test: `The student opened the test and realized`
root options: ' that' 0.339, ' he' 0.200, ' she' 0.093, ' the' 0.054
nodes: 17

### robot_button: `The robot saw the red button and`
root options: ' the' 0.043, ' then' 0.034, ' was' 0.024, ' started' 0.023
nodes: 17

### detective: `The detective found a single clue under the`
root options: ' door' 0.084, ' bed' 0.040, ' table' 0.031, ' car' 0.027
nodes: 17

### meeting: `The message said the meeting was moved to`
root options: ' a' 0.105, ' the' 0.095, ' an' 0.027, ' avoid' 0.026
nodes: 17

### dragon: `When the dragon reached the village, it`
root options: ' was' 0.132, ' began' 0.031, ' attacked' 0.025, ' had' 0.023
nodes: 17
