module.exports = function(sequelize, DataTypes){
	var NewPhoto = sequelize.define('photo',{
		id: {
			type: DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true
		},
		username: DataTypes.STRING,
		first_name:DataTypes.STRING,
		last_name:DataTypes.STRING,
		created_at: DataTypes.DATE,
		updated_at: DataTypes.DATE
	},{
		underscored:true,
		tableName:'photo'
	});

	return NewPhoto;
}    