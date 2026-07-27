import pytest
from unittest.mock import MagicMock
from api.controllers import orders as controller
from api.schemas.order import OrderCreate
from api.schemas.customer import CustomerCreate
from api.schemas.order_item import OrderItemCreate


@pytest.fixture
def db_session():
    """Mock SQLAlchemy database session."""
    session = MagicMock()
    session.query.return_value.filter.return_value.all.return_value = []
    session.query.return_value.filter.return_value.first.return_value = MagicMock(
        id=1, price=12.99, quantity_in_stock=100
    )
    return session


def test_create_order_structure(db_session):
    order_payload = OrderCreate(
        customer=CustomerCreate(
            name="John Doe",
            email="john@example.com",
            phone_number="555-123-4567",
            address="123 Main St"
        ),
        order_type="takeout",
        order_items=[
            OrderItemCreate(menu_item_id=1, quantity=2)
        ]
    )

    created_order = controller.create_order(db_session, order_payload)

    assert created_order is not None
    assert created_order.order_type == "takeout"
    assert created_order.order_status == "Pending"
    assert created_order.tracking_number.startswith("TRK-")
    assert db_session.commit.called