from pydantic import BaseModel


class IngredientBase(BaseModel):
    name: str
    quantity_in_stock: float
    unit: str


class IngredientCreate(IngredientBase):
    pass


class IngredientUpdate(BaseModel):
    quantity_in_stock: float


class Ingredient(IngredientBase):
    id: int

    class Config:
        from_attributes = True