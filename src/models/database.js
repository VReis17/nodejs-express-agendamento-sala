const bcrypt = require('bcryptjs');
const state = {
  rooms: [
    { id: 'sala-1', name: 'Sala Atlântico', capacity: 8, resources: ['TV', 'Videoconferência'], active: true },
    { id: 'sala-2', name: 'Sala Pacífico', capacity: 4, resources: ['Quadro branco'], active: true }
  ],
  employees: [
    { id: 'func-1', name: 'Gerente Demo', email: 'gerente@empresa.com', passwordHash: bcrypt.hashSync('Gerente@123', 10), role: 'manager' },
    { id: 'func-2', name: 'Funcionário Demo', email: 'funcionario@empresa.com', passwordHash: bcrypt.hashSync('Funcionario@123', 10), role: 'employee' }
  ],
  reservations: []
};
module.exports = state;
