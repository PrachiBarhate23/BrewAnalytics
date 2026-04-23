"""
BrewAnalytics - Extend Real Survey Data with Synthetic Reviews
==============================================================
Takes the real student survey data (35 responses x 9 shops = 315 reviews)
and extends it to ~2000+ reviews by generating synthetic reviews that
mimic the real students' writing style, vocabulary, and concerns.

The synthetic reviews do NOT have pre-labeled sentiments.
They only have: shop name, review text, and rating (1-5).
The BERT model will later classify the sentiment automatically.
"""

import random
import csv
import os
import pandas as pd
from datetime import datetime, timedelta

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# ─── Shop-specific review templates ─────────────────────────────────────────
# These are inspired by the REAL reviews from students, mimicking their
# actual concerns, vocabulary, and informal writing style.

SHOP_TEMPLATES = {
    "Manchurian Shop": {
        "high_rating": [  # 4-5 star style reviews
            "The manchurian is really good, tasty and flavourful",
            "Solid food, bhaji pav is especially good here",
            "Very good taste, pricing is reasonable for students",
            "Good quality food, consistent taste every time",
            "The manchurian is nostalgic, love the spice level",
            "Flavourful food, one of the better stalls around campus",
            "Bhaji pav and manchurian both are really tasty",
            "Good food at reasonable prices, students can afford it",
            "They make really good manchurian, always my go-to",
            "The food is tasty and portions are decent for the price",
            "One of the better options near college for quick food",
            "Really enjoy the manchurian here, it hits different",
        ],
        "mid_rating": [  # 3 star style reviews
            "It was good just hygiene issues are a concern",
            "Taste is okay but hygiene could be much better",
            "Not so hygienic, but food is edible",
            "Can be better, needs improvement in cleanliness",
            "They maintain bare minimum hygiene, taste is okay",
            "Good taste but its a gamble with hygiene honestly",
            "Okayish, mix veg and non veg utensils is an issue",
            "Decent enough but not my first choice",
            "Mid option, nothing great nothing terrible",
            "Food is average, cleanliness needs work",
            "Some days its good some days its not",
            "The taste is fine but the place looks dirty sometimes",
        ],
        "low_rating": [  # 1-2 star style reviews
            "Very unhygienic, flies hovering around the food",
            "Hygiene issues are serious, not clean at all",
            "Cheap quality manchurian, utterly disappointed",
            "Cleanliness standards did not meet expectations",
            "Not clean, can see flies hovering around",
            "Unhygienic, roadside dirty, not healthy at all",
            "The stall is dirty and they dont wear gloves",
            "Bad hygiene, water they use for cleaning looks dirty",
            "Would not recommend, too many hygiene problems",
            "Not worth risking your health for this food",
            "Dirty utensils and unhygienic food preparation",
            "I got sick after eating here, never again",
        ],
    },
    "Shawarma Shop": {
        "high_rating": [
            "So tasty! Best shawarma around campus",
            "Shawarma is my life, love this place",
            "Shawarma can never go wrong here, always good",
            "Service is really good and shawarma tastes great",
            "Good food, the flavours are delicious",
            "Best non-veg option near college, tasty shawarma",
            "Really good shawarma, perfectly spiced and filling",
            "The shawarma here is worth every rupee",
            "Always packed for a reason, the food is great",
            "Top quality shawarma, would recommend to everyone",
        ],
        "mid_rating": [
            "Its nice but still is not clean enough",
            "Taste is good but sourcing of ingredients is dubious",
            "Always a little uncooked, needs to cook properly",
            "Decent crowd but hygiene could be improved",
            "Chicken quality I doubt sometimes",
            "Not bad but cleanliness is a concern",
            "Average shawarma, nothing special about it",
            "Food is okay but the open stall feels unhygienic",
            "Needs better hygiene practices for food safety",
            "Its popular but I have my doubts about freshness",
        ],
        "low_rating": [
            "Find it very unhygienic, will not eat here",
            "Looks unhygienic in the open, roadside stall",
            "Smells near their shop, not clean at all",
            "The dining area needed better upkeep seriously",
            "No veg options at all, very exclusionary",
            "Never tried because it looks so unhygienic",
            "Non of them works on authentic taste",
            "Very small shop, roadside, unhygienic",
            "Dust from road gets into the food, gross",
            "Would not eat here, too risky for health",
        ],
    },
    "Amar Frankie": {
        "high_rating": [
            "Loved the frankie, mesmerising taste!",
            "The go to place for delicious frankie",
            "Fast tasty frankie and reasonable pricing",
            "Insane frankies, best snack near campus",
            "Yummy, tastier and healthier option for snacks",
            "Top 2 frankie shops, uses gloves, nice quantity",
            "Follows norms and regulations, good food quality",
            "Freshly made hot frankies, always delicious",
            "Tasty but spicy, love the frankie options here",
            "The frankies are well-stuffed and flavorful",
            "Great value for money, delicious frankies every time",
            "They have a lot of different frankie options to choose from",
        ],
        "mid_rating": [
            "Nice one just that it has too much food color",
            "The Frankie is okayish, scope for improvement",
            "Meh, nothing special about the frankies",
            "Decent but unhealthy ingredients sometimes",
            "Gives hot food in plastic which is concerning",
            "Not much idea, havent tried enough to comment",
            "Spicy but okayish overall quality",
            "Average taste, decent portion size",
            "Good taste but hygiene can be improved",
            "Its a quick snack option but quality varies",
        ],
        "low_rating": [
            "Unhygienic, cant see employees wearing gloves",
            "Hygiene wise its very bad, saw tobacco chewing",
            "Bad hygiene practices, food color usage is high",
            "Not clean enough for my standards",
            "Improve order accuracy, service is poor",
            "Quality has gone down recently, not worth it",
            "The frankies are overpriced for the quality",
            "Stale ingredients used sometimes, be careful",
        ],
    },
    "Juice Center": {
        "high_rating": [
            "Best juice place! Fresh fruits always",
            "Always gets fresh juice, love the variety",
            "Cold coffee supremacy! Best drinks on campus",
            "Nice and fresh juices, healthy option",
            "Love the Ganga Jamuna Saraswati drink",
            "Choco, Oreo, chocolate strawberry are amazing",
            "The variety of juice and shake options is great",
            "Healthiest and bestest juice place on campus",
            "Fresh fruits, seasonal menu is always exciting",
            "Really refreshing drinks, perfect for hot days",
            "Warm and sweet staff, seasonal menu is unique",
            "10/10 would recommend for fresh healthy drinks",
            "Even the packaging is solid, great presentation",
            "Good cleanliness and quality, very professional",
            "A really great option for days when u dont know what to have",
        ],
        "mid_rating": [
            "Tasty but a bit expensive for students",
            "Good but overpriced for what you get",
            "Average juice, could have more variety",
            "Looks professional but prices are high",
            "Contaminated water is a concern honestly",
            "Decent drinks, nothing extraordinary",
            "Fresh juice but portions could be bigger",
            "Quality of ingredients is sometimes a concern",
            "Good but not value for money always",
        ],
        "low_rating": [
            "Flavor was too diluted, tastes like water",
            "It tastes like water, overpriced for bland juice",
            "Too expensive for the quantity and quality",
            "Not worth the price students are paying",
            "Juice quality has gone down, not fresh always",
            "They dilute the juice too much with water",
        ],
    },
    "Cluckins": {
        "high_rating": [
            "Best chicken in the town, love it!",
            "Very nice presentation and taste overall",
            "Good food and easy on the pocket for students",
            "Nice place, proper shop with good ambiance",
            "The chicken is fresh and well-cooked always",
            "Really tasty with good portion sizes",
            "Great student offers and deals available",
            "Crispy and flavorful food, worth trying",
            "One of the best non-veg spots near campus",
        ],
        "mid_rating": [
            "Sometimes maybe good sometimes maybe not good",
            "Service is very slow, needs improvement",
            "Decent but nothing special about the food",
            "Sourcing of ingredients not fully trustworthy",
            "Proper shop not a stall, but menu is limited",
            "The place smells strong, ambiance could be better",
            "Average food, menu needs more options",
            "Chicken is okay but pricing is slightly high",
            "Not tried much but looks appealing enough",
        ],
        "low_rating": [
            "Too pricy for students, not affordable",
            "Common kitchen for veg and non veg is bad",
            "Soggy food, not crispy at all",
            "Never been there, doesnt look inviting",
            "Average at best, Bombay burgers is better",
            "Expensive for what they serve honestly",
            "Food was oily and not fresh at all",
            "Na, not a good experience at all",
        ],
    },
    "College Canteen Ground Floor": {
        "high_rating": [
            "Good variety of food options available",
            "Like it, decent food at student-friendly prices",
            "Very good food quality when they maintain it",
            "Cost-effective meals for daily eating",
            "The ground floor canteen is nice overall",
            "Food quality is good and pricing is student-friendly",
            "Chat centre is very good here, love the chaat",
            "Good enough for daily campus meals",
            "Need more items on the menu but overall good",
            "Okay service but food is decent enough",
        ],
        "mid_rating": [
            "Not too much options, menu is limited",
            "Too crowded during lunch hours always",
            "Cheap but unhygienic, needs improvement",
            "Limited menu, monotonous and boring food",
            "The go-to place but menu is limited",
            "Food is fine but hygiene needs to improve",
            "Too much waiting and food quality is average",
            "Standard campus canteen, nothing special",
            "Can have more food items and better variety",
            "Most items arent healthy or energetic enough",
        ],
        "low_rating": [
            "No variety in food, worst canteen honestly",
            "Cockroaches were in the coffee, never going again",
            "Too expensive for the quality they serve",
            "It smells awful, needs deep cleaning",
            "Worst canteen in campus, hygiene is terrible",
            "Needs cleanliness maintenance, food quality bad",
            "Saw cockroaches, unhygienic af honestly",
            "The place is filthy, no gloves used by staff",
            "It lacked flavour and freshness completely",
            "Staff dont wear gloves, smells really awful",
        ],
    },
    "College Canteen 3rd Floor": {
        "high_rating": [
            "Sandwiches are the best here, must try!",
            "Good food, homely, very good overall",
            "Better options than ground floor canteen",
            "Good management and clean environment",
            "Fresh ingredients and great flavors here",
            "Peaceful, quiet and airy space to sit and eat",
            "Sandwiches are good, cold coffee is nice too",
            "Nice canteen, comfortable seating area",
            "Better hygiene than the ground floor one",
            "Thali and lunch option available which is great",
        ],
        "mid_rating": [
            "Good but most days items are not available",
            "Sometimes good sometimes bad, inconsistent",
            "Misal pav is good and fulfilling at least",
            "Nice but needs more cleanliness effort",
            "Better but still lacks diversity in menu",
            "They can never replace the ground floor canteen",
            "Average food quality, pricing is okay",
            "Standard 3rd floor canteen experience",
            "Sandwiches are nice but rest is average",
            "I dont think they use fresh veggies always",
        ],
        "low_rating": [
            "No thank you, not going back there",
            "Too expensive for what they offer",
            "Slightly more decent but still not good enough",
            "Food quality is average and overpriced",
            "Not worth climbing 3 floors for this food",
            "Menu needs major improvement honestly",
        ],
    },
    "SPJIMR Mess": {
        "high_rating": [
            "Best canteen to ever exist on campus!",
            "Og Place, cannot beat this quality",
            "Goated food, best experience every time",
            "Best overall, food quality and quantity both great",
            "Outstanding food, clean and well-maintained",
            "Fast clean and tasty, the holy trinity",
            "Unlimited healthy nutritious food, love it",
            "Good food quality and quantity at great prices",
            "Raises your standards when you eat here",
            "Best experience, would recommend to everyone",
            "The food is hygienic and meals are well-balanced",
            "Strongly recommended for college students",
        ],
        "mid_rating": [
            "Tasty food and good options available",
            "Nice place but some things need improvement",
            "Good for daily meals, basic but decent",
            "Expensive but good quality food overall",
            "Quality did not meet expectations sometimes",
            "Good but food quality can be improved more",
            "Some things need to be improved for sure",
            "Decent mess, food is okay most days",
            "Average quality, could be much better",
        ],
        "low_rating": [
            "Unhygienic, saw issues in the kitchen area",
            "Cockroaches in the kitchen, not clean at all",
            "No other option so have to eat here sadly",
            "Haven't been there, doesnt seem appealing",
            "Bad food quality, not worth the price",
            "They dont wear gloves, very unhygienic",
            "Never been there, no interest honestly",
        ],
    },
    "Vrindavan": {
        "high_rating": [
            "Best food around campus, excellent quality!",
            "Perfect place for vegetarians, amazing variety",
            "Vrindavan is the best among all campus options",
            "Go to place, sizzling brownie has my heart",
            "Really good, pocket friendly and great food",
            "Best of all in comparison, top quality",
            "I love their service and food quality both",
            "A really good place for vegetarians, great variety",
            "Amazing food and great service, love it!",
            "Pav bhaji and aloo paratha is comfort food here",
            "Food quality is excellent, taste is very good",
            "Cleanliness and service are impressive here",
            "Another banger from Vrindavan, never disappoints",
            "Very good vegetarian food with lots of options",
            "Only place which provides proper sitting area",
        ],
        "mid_rating": [
            "Good taste but slightly expensive for students",
            "Good 2nd option after the mess",
            "Would prefer more options, same food sometimes",
            "Dost idhar le aate but pet nahi bharta fully",
            "Worth it but pricing could be more student-friendly",
            "I like their dosa but rest is average",
            "Good quality but expensive for daily eating",
            "Food is good but menu doesnt change much",
            "Vegetarian food only, need non-veg options too",
            "Good services but water glasses arent clean",
        ],
        "low_rating": [
            "Too expensive for students to eat regularly",
            "Pricy and not worth it for what they serve",
            "Vegetarian food only, no nonveg options is bad",
            "Na, not impressed with this place at all",
            "Overpriced restaurant, not campus-friendly pricing",
            "Not everything on the menu is available always",
        ],
    },
}

# Student names for synthetic reviews
STUDENT_NAMES = [
    "Aarav Sharma", "Ananya Patel", "Arjun Singh", "Diya Kumar", "Ishaan Gupta",
    "Kavya Shah", "Rohan Reddy", "Priya Joshi", "Vihaan Verma", "Sneha Iyer",
    "Aditya Nair", "Meera Bhat", "Kabir Desai", "Nisha Kulkarni", "Rahul Mehta",
    "Pooja Chauhan", "Vivek Yadav", "Riya Thakur", "Siddharth Malhotra", "Tanvi Chopra",
    "Neha Saxena", "Kiran Srivastava", "Amit Agarwal", "Shreya Mishra", "Suresh Pandey",
    "Divya Tiwari", "Raj Kapoor", "Sakshi Bhatia", "Manish Khanna", "Anjali Bansal",
    "Deepak Jain", "Kriti Goel", "Harsh Goyal", "Simran Kaur", "Vikram Rathod",
    "Pallavi Naik", "Gaurav Patil", "Sonia Roy", "Nikhil Das", "Ritika Mukherjee",
    "Akash Sinha", "Bhavna Dubey", "Chetan Rawat", "Ekta Bhardwaj", "Faizan Khan",
    "Gauri Menon", "Himanshu Lakra", "Isha Dixit", "Jayesh Pillai", "Komal Rane",
    "Lalit Pawar", "Manya Hegde", "Naveen Deshpande", "Ojas Wagh", "Pankaj More",
    "Rashmi Sawant", "Sahil Bajaj", "Tina George", "Umesh Nayak", "Varun Karnik",
]

SHOPS = list(SHOP_TEMPLATES.keys())


def rating_for_category(category: str) -> int:
    """Generate a realistic rating for a review category."""
    if category == "high_rating":
        return random.choice([4, 4, 5, 5, 5])
    elif category == "mid_rating":
        return random.choice([2, 3, 3, 3, 4])
    else:  # low_rating
        return random.choice([1, 1, 1, 2, 2])


def generate_date() -> str:
    """Generate a random date in the survey period."""
    start = datetime(2026, 2, 20)
    end = datetime(2026, 3, 25)
    delta = (end - start).days
    d = start + timedelta(days=random.randint(0, delta))
    return d.strftime("%m/%d/%Y %H:%M:%S")


def extend_dataset(target_total: int = 2000, seed: int = 42):
    """Extend real data with synthetic reviews."""
    random.seed(seed)

    # Load real data
    real_csv = os.path.join(SCRIPT_DIR, "real_survey_data.csv")
    real_df = pd.read_csv(real_csv)
    print(f"  Loaded {len(real_df)} real reviews")

    # Mark real data
    real_df["source"] = "real"

    # Generate synthetic reviews
    synthetic_rows = []
    reviews_needed = target_total - len(real_df)

    # Distribute across shops (roughly equal, with slight randomness)
    per_shop = reviews_needed // len(SHOPS)

    for shop in SHOPS:
        templates = SHOP_TEMPLATES[shop]
        # Distribution: ~50% high, ~30% mid, ~20% low (mimics real data skew)
        n_high = int(per_shop * 0.50)
        n_mid = int(per_shop * 0.30)
        n_low = per_shop - n_high - n_mid

        for _ in range(n_high):
            review = random.choice(templates["high_rating"])
            # Add slight variations
            review = _add_variation(review)
            synthetic_rows.append({
                "Timestamp": generate_date(),
                "Name": random.choice(STUDENT_NAMES),
                "Year": random.choice(["SE", "TE", "BE"]),
                "Shop": shop,
                "Rating": rating_for_category("high_rating"),
                "Review": review,
                "source": "synthetic",
            })

        for _ in range(n_mid):
            review = random.choice(templates["mid_rating"])
            review = _add_variation(review)
            synthetic_rows.append({
                "Timestamp": generate_date(),
                "Name": random.choice(STUDENT_NAMES),
                "Year": random.choice(["SE", "TE", "BE"]),
                "Shop": shop,
                "Rating": rating_for_category("mid_rating"),
                "Review": review,
                "source": "synthetic",
            })

        for _ in range(n_low):
            review = random.choice(templates["low_rating"])
            review = _add_variation(review)
            synthetic_rows.append({
                "Timestamp": generate_date(),
                "Name": random.choice(STUDENT_NAMES),
                "Year": random.choice(["SE", "TE", "BE"]),
                "Shop": shop,
                "Rating": rating_for_category("low_rating"),
                "Review": review,
                "source": "synthetic",
            })

    synthetic_df = pd.DataFrame(synthetic_rows)

    # Combine real + synthetic
    combined_df = pd.concat([real_df, synthetic_df], ignore_index=True)
    combined_df = combined_df.sample(frac=1, random_state=seed).reset_index(drop=True)

    return combined_df


def _add_variation(text: str) -> str:
    """Add slight random variations to make reviews more diverse."""
    variations = [
        lambda t: t,  # no change
        lambda t: t.lower(),  # all lowercase
        lambda t: t + "!",  # add excitement
        lambda t: t + ".",  # add period
        lambda t: t.rstrip(".!") + " tbh",  # add informal
        lambda t: t.rstrip(".!") + " honestly",
        lambda t: "Overall, " + t[0].lower() + t[1:],
        lambda t: "I think " + t[0].lower() + t[1:],
        lambda t: t.rstrip(".!") + " ngl",
    ]
    return random.choice(variations)(text)


def print_stats(df):
    """Print dataset statistics."""
    print("\n" + "=" * 60)
    print("  Extended Dataset Statistics")
    print("=" * 60)
    print(f"\n  Total Reviews: {len(df)}")
    print(f"  Real Reviews:  {len(df[df['source'] == 'real'])}")
    print(f"  Synthetic:     {len(df[df['source'] == 'synthetic'])}")

    print("\n  Reviews per Shop:")
    for shop in SHOPS:
        count = len(df[df["Shop"] == shop])
        avg_rating = df[df["Shop"] == shop]["Rating"].mean()
        print(f"    {shop:<35} {count:>4} reviews  (avg rating: {avg_rating:.1f})")

    print("\n  Rating Distribution:")
    for rating in range(1, 6):
        count = len(df[df["Rating"] == rating])
        pct = count / len(df) * 100
        stars = "★" * rating + "☆" * (5 - rating)
        print(f"    {stars}: {count:>4} ({pct:.1f}%)")

    print("\n  Sample Reviews (first 5):")
    print("  " + "-" * 56)
    for _, row in df.head(5).iterrows():
        text = row["Review"][:60] + "..." if len(str(row["Review"])) > 60 else row["Review"]
        print(f"    [{row['Shop']:<25}] ★{row['Rating']} {text}")

    print("\n" + "=" * 60)


if __name__ == "__main__":
    print("Extending real survey data with synthetic reviews...")

    df = extend_dataset(target_total=2000, seed=42)

    # Save extended dataset (WITHOUT sentiment labels - model will predict these)
    out_path = os.path.join(SCRIPT_DIR, "extended_reviews.csv")
    df.to_csv(out_path, index=False)
    print(f"\n  Extended dataset saved to: {out_path}")

    print_stats(df)
