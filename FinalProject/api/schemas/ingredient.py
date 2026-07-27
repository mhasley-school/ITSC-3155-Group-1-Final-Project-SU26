from pydantic import BaseModel, ConfigDict


class IngredientBase(BaseModel):
    name: str
    quantity_in_stock: float
    unit: str


class IngredientCreate(IngredientBase):
    pass


class IngredientUpdate(BaseModel):
    name: str | None = None
    quantity_in_stock: float | None = None
    unit: str | None = None


class Ingredient(IngredientBase):
    id: int

    model_config = ConfigDict(from_attributes=True)