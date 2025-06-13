import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json

from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["ecommerce_db"]
collection = db["products"]

products_cursor = collection.find()
products = list(products_cursor)
df = pd.DataFrame(products)

df['name'] = df['name'].fillna('')
df['category'] = df['category'].fillna('')

df['combined_features'] = df['name'] + ' ' + df['category']

vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(df['combined_features'])

cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

def recommend_products(product_id, top_n=5):
    idx = df[df['_id'] == product_id].index
    if len(idx) == 0:
        return []  
    idx = idx[0]
    
    sim_scores = list(enumerate(cosine_sim[idx]))
    
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    sim_scores = sim_scores[1:top_n+1]
    
    product_indices = [i[0] for i in sim_scores]
    
    recommended = df.iloc[product_indices].to_dict(orient='records')
    return recommended
