const userService = require('../../core/services/user.service');
const AppError = require('../../core/errors/AppError');
const ERROR_CODES = require('../../core/errors/error.codes');

// Usuario obtiene su propio perfil
const getMe = async (req, res) => {
  const userProfile = req.user;

  res.status(200).json({
    message: 'Perfil obtenido exitosamente.',
    data: userProfile
  });
};

// Admin lista todos los usuarios con filtros
const getUsers = async (req, res, next) => {
  try {
    const filters = {
      rol: req.query.rol,
      activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined,
      search: req.query.search,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20
    };
    
    const result = await userService.getAllUsers(filters);
    
    res.status(200).json({ 
      success: true,
      data: result.users,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// Admin obtiene usuario por ID
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    if (error.message.includes('no encontrado')) {
      return next(new AppError(ERROR_CODES.USER_NOT_FOUND, 404));
    }
    next(error);
  }
};

// Usuario actualiza su propio perfil
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updatedUser = await userService.updateUserProfile(userId, req.body);
    
    res.status(200).json({
      message: 'Perfil actualizado exitosamente.',
      data: updatedUser
    });
  } catch (error) {
    next(error);
  }
};

// Admin crea nuevo usuario
const createUser = async (req, res, next) => {
  try {
    const newUser = await userService.createUser(req.body);
    
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente. Guarda estas credenciales, no se mostrarán nuevamente.',
      data: {
        usuario: {
          id: newUser.id,
          nombre: newUser.nombre,
          email: newUser.email,
          telefono: newUser.telefono,
          direccion: newUser.direccion,
          rol: newUser.rol,
          activo: newUser.activo,
          passwordTemporal: newUser.passwordTemporal
        },
        credenciales: {
          email: newUser.email,
          password: newUser.passwordGenerada
        }
      }
    });
  } catch (error) {
    if (error.code === 'USER_EMAIL_EXISTS') {
      return next(new AppError(ERROR_CODES.USER_EMAIL_EXISTS, 409));
    }
    next(error);
  }
};

// Admin cambia rol de usuario
const changeUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { rol } = req.body;
    
    const updatedUser = await userService.changeUserRole(id, rol);
    
    res.status(200).json({
      success: true,
      message: 'Rol actualizado exitosamente.',
      data: updatedUser
    });
  } catch (error) {
    if (error.code === 'USER_NOT_FOUND') {
      return next(new AppError(ERROR_CODES.USER_NOT_FOUND, 404));
    }
    if (error.code === 'USER_CANNOT_DEMOTE_LAST_ADMIN') {
      return next(new AppError(ERROR_CODES.USER_CANNOT_DEMOTE_LAST_ADMIN, 400));
    }
    next(error);
  }
};

// Admin desactiva usuario
const deactivateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.id;
    
    const updatedUser = await userService.deactivateUser(id, adminId);
    
    res.status(200).json({
      success: true,
      message: 'Usuario desactivado exitosamente.',
      data: updatedUser
    });
  } catch (error) {
    if (error.code === 'USER_NOT_FOUND') {
      return next(new AppError(ERROR_CODES.USER_NOT_FOUND, 404));
    }
    if (error.code === 'USER_CANNOT_DEACTIVATE_SELF') {
      return next(new AppError(ERROR_CODES.USER_CANNOT_DEACTIVATE_SELF, 400));
    }
    if (error.code === 'USER_ALREADY_INACTIVE') {
      return next(new AppError(ERROR_CODES.USER_ALREADY_INACTIVE, 400));
    }
    next(error);
  }
};

// Admin reactiva usuario
const activateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const updatedUser = await userService.activateUser(id);
    
    res.status(200).json({
      success: true,
      message: 'Usuario reactivado exitosamente.',
      data: updatedUser
    });
  } catch (error) {
    if (error.code === 'USER_NOT_FOUND') {
      return next(new AppError(ERROR_CODES.USER_NOT_FOUND, 404));
    }
    if (error.code === 'USER_ALREADY_ACTIVE') {
      return next(new AppError(ERROR_CODES.USER_ALREADY_ACTIVE, 400));
    }
    next(error);
  }
};

// Admin elimina usuario permanentemente
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await userService.deleteUser(id);
    
    res.status(200).json({
      success: true,
      message: 'Usuario eliminado permanentemente.',
      data: result
    });
  } catch (error) {
    if (error.code === 'USER_NOT_FOUND') {
      return next(new AppError(ERROR_CODES.USER_NOT_FOUND, 404));
    }
    if (error.code === 'USER_HAS_ACTIVE_ORDERS') {
      return next(new AppError(ERROR_CODES.USER_HAS_ACTIVE_ORDERS, 400));
    }
    next(error);
  }
};

module.exports = {
  getMe,
  getUsers,
  getUserById,
  updateProfile,
  createUser,
  changeUserRole,
  deactivateUser,
  activateUser,
  deleteUser,
};
