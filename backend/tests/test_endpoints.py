import json
import pytest
def test_get_contacts(client, sample_contacts):
    """Test retrieving all contacts."""
    response = client.get('/contacts')
    data = json.loads(response.data)

    assert response.status_code == 200
    assert len(data['contacts']) == 3
    assert data['contacts'][0]['firstName'] == 'John'

def test_create_contact(client):
    """Test creating a new contact."""
    new_contact = {
        "firstName": "Test",
        "lastName": "User",
        "email": "test@example.com"
    }

    response = client.post('/create_contact',
                            data=json.dumps(new_contact),
                            content_type='application/json')
    
    assert response.status_code == 201

    # Verify the contact was created
    get_response = client.get('/contacts')
    data = json.loads(get_response.data)
    emails = [contact['email'] for contact in data['contacts']]
    assert "test@example.com" in emails

def test_update_contact(client, sample_contacts):
    """Test updating an existing contact."""
    # Get the ID of the first contact
    response = client.get('/contacts')
    data = json.loads(response.data)
    contact_id = data['contacts'][0]['id']

    updated_contact = {
        "firstName": "UpdatedName",
        "lastName": "UpdatedLastName",
        "email": "updated@example.com"
    }
    response = client.patch(f'/update_contact/{contact_id}',
                            data=json.dumps(updated_contact),
                            content_type='application/json')
    
    assert response.status_code == 200

    # Verify the contact was updated
    get_response = client.get('/contacts')
    data = json.loads(get_response.data)
    for contact in data['contacts']:
        if contact['id'] == contact_id:
            assert contact['firstName'] == "UpdatedName"
            assert contact['email'] == "updated@example.com"

def test_delete_contact(client, sample_contacts):
    """Test deleting a contact."""
    # Get the ID of the first contact
    response = client.get('/contacts')
    data = json.loads(response.data)
    contact_id = data['contacts'][0]['id']
    initial_count = len(data['contacts'])

    # Delete the contact
    response = client.delete(f'/delete_contact/{contact_id}')
    assert response.status_code == 200

    # Verify the contact was deleted
    get_response = client.get('/contacts')
    data = json.loads(get_response.data)
    assert len(data['contacts']) == initial_count - 1